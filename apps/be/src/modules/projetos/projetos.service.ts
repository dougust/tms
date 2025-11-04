import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { empresas, projetos } from '@dougust/database';
import { IProjetoListDto } from '@dougust/types';
import { eq } from 'drizzle-orm';
import { CreateProjetoDto } from './dto/create-projeto.dto';
import { UpdateProjetoDto } from './dto/update-projeto.dto';
import { UserContextService } from '../../common/user-context/user-context.service';

@Injectable()
export class ProjetosService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    @Inject() private readonly userContext: UserContextService
  ) {}

  get table() {
    return projetos(this.userContext.businessId);
  }

  get empresas() {
    return empresas(this.userContext.businessId);
  }

  async create(dto: CreateProjetoDto) {
    const [projeto] = await this.db
      .insert(this.table)
      .values({
        empresa_id: dto.empresa_id ?? null,
        nome: dto.nome,
        inicio: dto.inicio as any,
        fim: dto.fim as any,
      })
      .returning();

    return { projeto };
  }

  async findAll(): Promise<IProjetoListDto[]> {
    return await this.db
      .select({
        projeto: this.table,
        empresa: this.empresas,
      })
      .from(this.table)
      .innerJoin(this.empresas, eq(this.table.empresa_id, this.empresas.id));
  }

  async findOne(id: string) {
    const where = eq(this.table.id, id);

    const result = await this.db
      .select()
      .from(this.table)
      .where(where)
      .limit(1);

    const entity = result[0];
    if (!entity) throw new NotFoundException('Projeto not found');
    return entity;
  }

  async update(id: string, dto: UpdateProjetoDto) {
    const [projeto] = await this.db
      .update(this.table)
      .set({
        empresa_id: dto.empresa_id ?? undefined,
        nome: dto.nome ?? undefined,
        inicio: (dto.inicio as any) ?? undefined,
        fim: (dto.fim as any) ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(this.table.id, id))
      .returning();

    if (!projeto) throw new NotFoundException('Projeto not found');

    return { projeto };
  }

  async remove(id: string) {
    const where = eq(this.table.id, id);

    const [deleted] = await this.db.delete(this.table).where(where).returning();
    if (!deleted) throw new NotFoundException('Projeto not found');
    return deleted;
  }
}
