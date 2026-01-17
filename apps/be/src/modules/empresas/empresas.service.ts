import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { empresas } from '@dougust/database';
import { eq } from 'drizzle-orm';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>
  ) {}

  async create(dto: CreateEmpresaDto) {
    const [empresa] = await this.db
      .insert(empresas)
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
    return await this.db.select().from(empresas);
  }

  async findOne(id: string) {
    const result = await this.db
      .select({ empresa: empresas })
      .from(empresas)
      .where(eq(empresas.id, id))
      .limit(1);

    const entity = result[0];
    if (!entity) throw new NotFoundException('Empresa not found');
    return entity;
  }

  async update(id: string, dto: UpdateEmpresaDto) {
    const [empresa] = await this.db
      .update(empresas)
      .set({
        razao: dto.razao ?? undefined,
        fantasia: dto.fantasia ?? undefined,
        cnpj: dto.cnpj ?? undefined,
        registro: dto.registro ?? undefined,
        phone: dto.phone ?? undefined,
        email: dto.email ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(empresas.id, id))
      .returning();

    if (!empresa) throw new NotFoundException('Empresa not found');

    return { empresa };
  }

  async remove(id: string) {
    const [deleted] = await this.db
      .delete(empresas)
      .where(eq(empresas.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('Empresa not found');
    return deleted;
  }
}
