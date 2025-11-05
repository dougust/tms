import { Inject, Injectable } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { tiposDiaria } from '@dougust/database';
import { UserContextService } from '../../common/user-context/user-context.service';

@Injectable()
export class TiposDiariaService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    private readonly userContext: UserContextService
  ) {}

  get table() {
    return tiposDiaria(this.userContext.businessId);
  }

  async findAll() {
    return await this.db.select().from(this.table);
  }
}
