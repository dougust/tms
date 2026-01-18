import { Inject, Injectable } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { RangeQueryDto } from './dto/range-query.dto';
import { and, eq, gte, lte } from 'drizzle-orm';
import { CreateDiariaDto } from './dto/create-diaria.dto';
import { FuncionariosService } from '../funcionarios/funcionarios.service';
import { ProjetosService } from '../projetos/projetos.service';
import { DiariaDto } from './dto/diaria.dto';
import { CreateManyDiariasDto } from './dto/create-many-diarias.dto';
import { diarias } from '@dougust/database';

@Injectable()
export class DiariasService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    private readonly funcionariosService: FuncionariosService,
    private readonly projetosService: ProjetosService
  ) {}

  async findInRange(query: RangeQueryDto): Promise<DiariaDto[]> {
    return this.db.query.diarias.findMany({
      where: and(gte(diarias.dia, query.from), lte(diarias.dia, query.to)),
    });
  }

  async create(data: CreateDiariaDto) {
    const [funcionario, projeto] = await Promise.all([
      this.funcionariosService.findOne(data.funcionarioId),
      this.projetosService.findOne(data.projetoId),
    ]);

    if (!funcionario) {
      throw new Error('Funcionario not found');
    }

    if (!projeto) {
      throw new Error('Projeto not found');
    }

    const [created] = await this.db
      .insert(diarias)
      .values({
        funcionarioId: data.funcionarioId,
        projetoId: data.projetoId,
        dia: data.dia,
        tipoDiaria: data.tipoDiaria ?? null,
      })
      .returning();

    return created;
  }

  async createMany({ items }: CreateManyDiariasDto): Promise<DiariaDto[]> {
    if (!Array.isArray(items) || items.length === 0) return [];
    const results: DiariaDto[] = [];
    for (const dto of items) {
      const created = await this.create(dto);
      results.push(created);
    }
    return results;
  }

  async update(id: string, data: CreateDiariaDto) {
    const [diaria] = await this.db
      .update(diarias)
      .set({
        projetoId: data.projetoId,
        tipoDiaria: data.tipoDiaria ?? undefined,
      })
      .where(eq(diarias.id, id))
      .returning();

    return diaria;
  }
}
