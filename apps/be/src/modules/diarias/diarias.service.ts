import { Inject, Injectable } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { UserContextService } from '../../common/user-context/user-context.service';
import { RangeQueryDto } from './dto/range-query.dto';
import { and, eq, gt, lt } from 'drizzle-orm';
import {
  IDiariaFuncionarioDto,
  IDiariaFuncionarioResultDto,
} from '@dougust/types';
import { UpdateDiariaDto } from '../funcionarios/dto/update-diaria.dto';
import { FuncionariosService } from '../funcionarios/funcionarios.service';
import { ProjetosService } from '../projetos/projetos.service';

@Injectable()
export class DiariasService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    @Inject() private readonly userContext: UserContextService,
    private readonly funcionariosService: FuncionariosService,
    private readonly projetosService: ProjetosService
  ) {}

  get funcionarions() {
    return schema.funcionarios(this.userContext.businessId);
  }

  get diarias() {
    return schema.diarias(this.userContext.businessId);
  }

  get diariasToFuncionarios() {
    return schema.diariasToFuncionarios(this.userContext.businessId);
  }

  async findInRange(
    query: RangeQueryDto
  ): Promise<IDiariaFuncionarioResultDto> {
    const [funcionarios, diarias] = await Promise.all([
      this.db.select().from(this.funcionarions),
      this.db
        .select({
          entity: this.diarias,
          rel: this.diariasToFuncionarios,
        })
        .from(this.diarias)
        .where(
          and(gt(this.diarias.dia, query.from), lt(this.diarias.dia, query.to))
        )
        .leftJoin(
          this.diariasToFuncionarios,
          eq(this.diariasToFuncionarios.diariasId, this.diarias.id)
        ),
    ]);

    const funcionarioDict: Record<string, IDiariaFuncionarioDto> =
      funcionarios.reduce((acc, funcionario) => {
        acc[funcionario.id] = { ...funcionario, diarias: {} };
        return acc;
      }, {});

    for (const diaria of diarias) {
      const funcionario = funcionarioDict[diaria.rel.funcionarioId];

      if (diaria.entity.dia in funcionario.diarias) {
        funcionario.diarias[diaria.entity.dia].push({
          ...diaria.entity,
          ...diaria.rel,
        });
      } else {
        funcionario.diarias[diaria.entity.dia] = [
          { ...diaria.entity, ...diaria.rel },
        ];
      }
    }

    return {
      funcionarios: Object.values(funcionarioDict),
    };
  }

  async updateDiaria(data: UpdateDiariaDto) {
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

    let [diaria] = await this.db
      .select()
      .from(this.diarias)
      .where(
        and(
          eq(this.diarias.dia, data.dia),
          eq(this.diarias.projetoId, data.projetoId)
        )
      )
      .limit(1);

    if (!diaria) {
      const [created] = await this.db
        .insert(this.diarias)
        .values({
          projetoId: data.projetoId,
          dia: data.dia,
        })
        .onConflictDoNothing()
        .returning();

      diaria = created;
    }

    return this.db
      .insert(this.diariasToFuncionarios)
      .values({
        funcionarioId: data.funcionarioId,
        diariasId: diaria.id,
        tipo: data.tipo,
      })
      .onConflictDoUpdate({
        target: [
          this.diariasToFuncionarios.funcionarioId,
          this.diariasToFuncionarios.diariasId,
        ],
        set: {
          tipo: data.tipo,
          updatedAt: new Date(),
        },
      })
      .returning();
  }
}
