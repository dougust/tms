import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { projetos } from '@dougust/database';
import { eq } from 'drizzle-orm';
import { CreateProjetoDto } from './dto/create-projeto.dto';
import { UpdateProjetoDto } from './dto/update-projeto.dto';
import { ProjetoDto } from './dto/projeto.dto';

@Injectable()
export class ProjetosService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>
  ) {}

  async create(dto: CreateProjetoDto) {
    const [projeto] = await this.db
      .insert(projetos)
      .values({
        empresaId: dto.empresaId ?? null,
        nome: dto.nome,
        inicio: dto.inicio,
        fim: dto.fim,
      })
      .returning();

    return { projeto };
  }

  findAll(): Promise<ProjetoDto[]> {
    return this.db.select().from(projetos);
  }

  async findOne(id: string) {
    const result = await this.db
      .select()
      .from(projetos)
      .where(eq(projetos.id, id))
      .limit(1);

    const entity = result[0];
    if (!entity) throw new NotFoundException('Projeto not found');
    return entity;
  }

  async update(id: string, dto: UpdateProjetoDto) {
    const [projeto] = await this.db
      .update(projetos)
      .set({
        empresaId: dto.empresaId ?? undefined,
        nome: dto.nome ?? undefined,
        inicio: dto.inicio ?? undefined,
        fim: dto.fim ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(projetos.id, id))
      .returning();

    if (!projeto) throw new NotFoundException('Projeto not found');

    return { projeto };
  }

  async remove(id: string) {
    const [deleted] = await this.db
      .delete(projetos)
      .where(eq(projetos.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('Projeto not found');
    return deleted;
  }
}
