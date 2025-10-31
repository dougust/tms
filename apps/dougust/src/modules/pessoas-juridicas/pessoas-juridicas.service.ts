import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { and, eq } from 'drizzle-orm';
import { CreatePessoaJuridicaDto } from './dto/create-pessoa-juridica.dto';
import { UpdatePessoaJuridicaDto } from './dto/update-pessoa-juridica.dto';
import { UserContextService } from '../../common/user-context/user-context.service';
import { pessoasJuridicas } from '@dougust/database';

@Injectable()
export class PessoasJuridicasService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    @Inject() private readonly userContext: UserContextService
  ) {}

  get table() {
    return pessoasJuridicas(this.userContext.businessId);
  }

  async create(dto: CreatePessoaJuridicaDto) {
    const [created] = await this.db
      .insert(this.table)
      .values({
        cnpj: dto.cnpj,
        nomeFantasia: dto.nomeFantasia ?? null,
      })
      .returning();
    return created;
  }

  async findAll(businessId?: string) {
    if (businessId) {
      return this.db
        .select()
        .from(this.table)
        .where(eq(this.table, businessId));
    }
    return this.db.select().from(this.table);
  }

  async findOne(id: string, businessId?: string) {
    const where = businessId
      ? and(eq(this.table.id, id))
      : eq(this.table.id, id);

    const result = await this.db
      .select()
      .from(this.table)
      .where(where)
      .limit(1);
    const entity = result[0];
    if (!entity) throw new NotFoundException('PessoaJuridica not found');
    return entity;
  }

  async update(id: string, dto: UpdatePessoaJuridicaDto) {
    const where = dto.businessId
      ? and(eq(this.table.id, id))
      : eq(this.table.id, id);

    const [updated] = await this.db
      .update(this.table)
      .set({
        cnpj: dto.cnpj ?? undefined,
        nomeFantasia:
          dto.nomeFantasia === undefined ? undefined : dto.nomeFantasia,
        updatedAt: new Date(),
      })
      .where(where)
      .returning();

    if (!updated) throw new NotFoundException('PessoaJuridica not found');
    return updated;
  }

  async remove(id: string, businessId?: string) {
    const where = businessId
      ? and(eq(this.table.id, id))
      : eq(this.table.id, id);

    const [deleted] = await this.db.delete(this.table).where(where).returning();
    if (!deleted) throw new NotFoundException('PessoaJuridica not found');
    return deleted;
  }
}
