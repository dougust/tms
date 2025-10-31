import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { pessoasJuridicas } from '@dougust/database';
import { eq, and } from 'drizzle-orm';
import { CreatePessoaJuridicaDto } from './dto/create-pessoa-juridica.dto';
import { UpdatePessoaJuridicaDto } from './dto/update-pessoa-juridica.dto';

@Injectable()
export class PessoasJuridicasService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>
  ) {}

  async create(dto: CreatePessoaJuridicaDto) {
    const [created] = await this.db
      .insert(pessoasJuridicas)
      .values({
        businessId: dto.businessId,
        cnpj: dto.cnpj,
        accessTokenEncrypted: dto.accessTokenEncrypted,
        webhookVerifyToken: dto.webhookVerifyToken,
        nomeFantasia: dto.nomeFantasia ?? null,
      })
      .returning();
    return created;
  }

  async findAll(businessId?: string) {
    if (businessId) {
      return this.db.select().from(pessoasJuridicas).where(eq(pessoasJuridicas.businessId, businessId));
    }
    return this.db.select().from(pessoasJuridicas);
  }

  async findOne(id: string, businessId?: string) {
    const where = businessId
      ? and(eq(pessoasJuridicas.id, id), eq(pessoasJuridicas.businessId, businessId))
      : eq(pessoasJuridicas.id, id);

    const result = await this.db.select().from(pessoasJuridicas).where(where).limit(1);
    const entity = result[0];
    if (!entity) throw new NotFoundException('PessoaJuridica not found');
    return entity;
  }

  async update(id: string, dto: UpdatePessoaJuridicaDto) {
    const where = dto.businessId
      ? and(eq(pessoasJuridicas.id, id), eq(pessoasJuridicas.businessId, dto.businessId))
      : eq(pessoasJuridicas.id, id);

    const [updated] = await this.db
      .update(pessoasJuridicas)
      .set({
        // avoid changing businessId via update unless provided explicitly
        businessId: dto.businessId ?? undefined,
        cnpj: dto.cnpj ?? undefined,
        accessTokenEncrypted: dto.accessTokenEncrypted ?? undefined,
        webhookVerifyToken: dto.webhookVerifyToken ?? undefined,
        nomeFantasia: dto.nomeFantasia === undefined ? undefined : dto.nomeFantasia,
        updatedAt: new Date(),
      })
      .where(where)
      .returning();

    if (!updated) throw new NotFoundException('PessoaJuridica not found');
    return updated;
  }

  async remove(id: string, businessId?: string) {
    const where = businessId
      ? and(eq(pessoasJuridicas.id, id), eq(pessoasJuridicas.businessId, businessId))
      : eq(pessoasJuridicas.id, id);

    const [deleted] = await this.db.delete(pessoasJuridicas).where(where).returning();
    if (!deleted) throw new NotFoundException('PessoaJuridica not found');
    return deleted;
  }
}
