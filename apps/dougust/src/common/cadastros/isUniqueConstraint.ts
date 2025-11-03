import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { UserContextService } from '../user-context/user-context.service';
import { eq } from 'drizzle-orm';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    private readonly userContext: UserContextService
  ) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [tableSelector, property] = args.constraints;

    if (!tableSelector || !property) {
      throw new Error('Entity and property must be specified in @IsUnique');
    }
    const table = tableSelector(this.userContext.businessId);

    const existing = await this.db
      .select()
      .from(table)
      .where(eq(table[property], value))
      .limit(1);

    return existing.length === 0;
  }

  defaultMessage(args: ValidationArguments): string {
    const [_, property] = args.constraints;
    return `${property} "${args.value}" already exists`;
  }
}

// Derive a union type of selector functions exported from the schema
// A selector is any exported function that takes a tenantId (string) and returns a table-like object
type SchemaSelectors = {
  [K in keyof typeof schema]: (typeof schema)[K] extends (tenantId: string) => any
    ? (typeof schema)[K]
    : never;
}[keyof typeof schema];

export function IsUnique<
  TSelector extends SchemaSelectors,
  TProp extends keyof ReturnType<TSelector>
>(
  tSelector: TSelector,
  property: TProp,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [tSelector, property],
      validator: IsUniqueConstraint,
    });
  };
}
