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

@Injectable()
export class DiariasService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    @Inject() private readonly userContext: UserContextService
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
          diaria: this.diarias,
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
        acc[funcionario.id] = { ...funcionario, diarias: [] };
        return acc;
      }, {});

    for (const diaria of diarias) {
      const funcionario = funcionarioDict[diaria.rel.funcionarioId];
      funcionario.diarias.push({ ...diaria.diaria, ...diaria.rel });
    }

    return {
      funcionarios: Object.values(funcionarioDict),
    };
  }
}
