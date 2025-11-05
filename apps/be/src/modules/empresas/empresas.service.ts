import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { empresas } from '@dougust/database';
import { eq } from 'drizzle-orm';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { UserContextService } from '../../common/user-context/user-context.service';

@Injectable()
export class EmpresasService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    @Inject() private readonly userContext: UserContextService
  ) {}

  get table() {
    return empresas(this.userContext.businessId);
  }

  async create(dto: CreateEmpresaDto) {
    const [empresa] = await this.db
      .insert(this.table)
      .values({
        razao: dto.razao ?? null,
        fantasia: dto.fantasia ?? null,
        cnpj: dto.cnpj,
        registro: dto.registro ?? null,
        phone: dto.phone ?? null,
        email: dto.email,
      })
      .returning();

    return { empresa };
  }

  async findAll() {
    return await this.db.select().from(this.table);
  }

  async findOne(id: string) {
    const where = eq(this.table.id, id);

    const result = await this.db
      .select({ empresa: this.table })
      .from(this.table)
      .where(where)
      .limit(1);

    const entity = result[0];
    if (!entity) throw new NotFoundException('Empresa not found');
    return entity;
  }

  async update(id: string, dto: UpdateEmpresaDto) {
    const [empresa] = await this.db
      .update(this.table)
      .set({
        razao: dto.razao ?? undefined,
        fantasia: dto.fantasia ?? undefined,
        cnpj: dto.cnpj ?? undefined,
        registro: dto.registro ?? undefined,
        phone: dto.phone ?? undefined,
        email: dto.email ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(this.table.id, id))
      .returning();

    if (!empresa) throw new NotFoundException('Empresa not found');

    return { empresa };
  }

  async remove(id: string) {
    const where = eq(this.table.id, id);

    const [deleted] = await this.db.delete(this.table).where(where).returning();
    if (!deleted) throw new NotFoundException('Empresa not found');
    return deleted;
  }
}
