import { Inject, Injectable } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { UserContextService } from '../../common/user-context/user-context.service';
import { RangeQueryDto } from './dto/range-query.dto';
import { and, eq, gt, lt } from 'drizzle-orm';
import { CreateDiariaDto } from './dto/create-diaria.dto';
import { FuncionariosService } from '../funcionarios/funcionarios.service';
import { ProjetosService } from '../projetos/projetos.service';
import { DiariaDto } from './dto/diaria.dto';

@Injectable()
export class DiariasService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    @Inject() private readonly userContext: UserContextService,
    private readonly funcionariosService: FuncionariosService,
    private readonly projetosService: ProjetosService
  ) {}

  get diarias() {
    return schema.diarias(this.userContext.businessId);
  }

  async findInRange(query: RangeQueryDto): Promise<DiariaDto[]> {
    return this.db
      .select()
      .from(this.diarias)
      .where(
        and(gt(this.diarias.dia, query.from), lt(this.diarias.dia, query.to))
      );
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
      .insert(this.diarias)
      .values({
        funcionarioId: data.funcionarioId,
        projetoId: data.projetoId,
        dia: data.dia,
      })
      .returning();

    return created;
  }

  async update(id: string, data: CreateDiariaDto) {
    const [diaria] = await this.db
      .update(this.diarias)
      .set({
        projetoId: data.projetoId,
      })
      .where(eq(this.diarias.id, id))
      .returning();

    return diaria;
  }
}
