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
import { eq, Table } from 'drizzle-orm';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>
  ) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [table, property] = args.constraints;

    if (!table || !property) {
      throw new Error('Entity and property must be specified in @IsUnique');
    }

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

export function IsUnique<
  TTable extends Table,
  TProp extends string
>(
  table: TTable,
  property: TProp,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [table, property],
      validator: IsUniqueConstraint,
    });
  };
}
