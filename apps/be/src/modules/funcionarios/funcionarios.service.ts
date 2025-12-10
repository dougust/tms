import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { funcionarios, IFuncionarioTable, beneficios as beneficiosTbl, lookup as lookupTbl } from '@dougust/database';
import { and, eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { UserContextService } from '../../common/user-context/user-context.service';
import { FuncionarioDto } from './dto/get-funcionario.response.dto';

@Injectable()
export class FuncionariosService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    @Inject() private readonly userContext: UserContextService
  ) {}

  get table(): IFuncionarioTable {
    return funcionarios(this.userContext.businessId);
  }

  private get beneficiosTable() {
    return beneficiosTbl(this.userContext.businessId);
  }

  private get lookupTable() {
    return lookupTbl(this.userContext.businessId);
  }

  async create(dto: CreateFuncionarioDto) {
    return await this.db.transaction(async (tx) => {

      let funcaoId: string | null = null;
      const funcaoNome = (dto.funcao ?? '').trim();
      if (funcaoNome) {
        const [funcaoLookup] = await tx
          .select({ id: this.lookupTable.id })
          .from(this.lookupTable)
          .where(and(eq(this.lookupTable.grupo, 'Funcao'), eq(this.lookupTable.nome, funcaoNome)))
          .limit(1);

        if (!funcaoLookup) {
          throw new NotFoundException(`Lookup não encontrado para função: ${funcaoNome}`);
        }
        funcaoId = funcaoLookup.id as unknown as string;
      }

      const [funcionario] = await tx
        .insert(this.table)
        .values({
          nome: dto.nome ?? null,
          social: dto.social ?? null,
          cpf: dto.cpf,
          nascimento: dto.nascimento ?? null,
          phone: dto.phone ?? null,
          email: dto.email,
          projetoId: dto.projetoId,
          rg: dto.rg ?? null,
          funcao: funcaoId,
          dependetes: dto.dependetes ?? null,
        })
        .returning();

      const benefitRows: { lookupId: string; funcionarioId: string; valor: number }[] = [];

      if (dto.beneficios && dto.beneficios.length > 0) {
        const ids = dto.beneficios.map((b) => b.lookupId);
        const found = await tx
          .select({ id: this.lookupTable.id })
          .from(this.lookupTable)
          .where(and(eq(this.lookupTable.grupo, 'beneficios'), inArray(this.lookupTable.id, ids)));

        const validIds = new Set(found.map((r) => r.id as unknown as string));
        const missing = ids.filter((id) => !validIds.has(id));
        if (missing.length) {
          throw new NotFoundException(
            `Lookups não encontrados (grupo 'beneficios') para os IDs: ${missing.join(', ')}`
          );
        }

        for (const b of dto.beneficios) {
          benefitRows.push({ lookupId: b.lookupId, funcionarioId: funcionario.id, valor: b.valor });
        }
      }

      if (benefitRows.length > 0) {
        await tx.insert(this.beneficiosTable).values(benefitRows);
      }

      return { funcionario };
    });
  }

  async findAll(): Promise<FuncionarioDto[]> {
    return this.db
      .select({
        ...getTableColumns(this.table),
        ...this.withCalculatedFields(),
      })
      .from(this.table);
  }

  async findOne(id: string): Promise<FuncionarioDto> {
    const where = eq(this.table.id, id);

    const result = await this.db
      .select({
        ...getTableColumns(this.table),
        ...this.withCalculatedFields(),
      })
      .from(this.table)
      .where(where)
      .limit(1);

    const entity = result[0];
    if (!entity) throw new NotFoundException('Funcionario not found');
    return entity;
  }

  async update(id: string, dto: UpdateFuncionarioDto) {
    return await this.db.transaction(async (tx) => {

      let funcaoUpdate: string | null | undefined = undefined;
      if (dto.funcao !== undefined) {
        const funcaoNome = (dto.funcao ?? '').trim();
        if (!funcaoNome) {
          funcaoUpdate = null;
        } else {
          const [funcaoLookup] = await tx
            .select({ id: this.lookupTable.id })
            .from(this.lookupTable)
            .where(and(eq(this.lookupTable.grupo, 'Funcao'), eq(this.lookupTable.nome, funcaoNome)))
            .limit(1);
          if (!funcaoLookup) {
            throw new NotFoundException(`Lookup não encontrado para função: ${funcaoNome}`);
          }
          funcaoUpdate = funcaoLookup.id as unknown as string;
        }
      }

      const [funcionario] = await tx
        .update(this.table)
        .set({
          nome: dto.nome ?? undefined,
          social: dto.social ?? undefined,
          cpf: dto.cpf ?? undefined,
          nascimento: dto.nascimento ?? undefined,
          phone: dto.phone ?? undefined,
          email: dto.email ?? undefined,
          rg: dto.rg ?? undefined,
          updatedAt: new Date(),
          funcao: funcaoUpdate,
          dependetes: dto.dependetes ?? undefined,
        })
        .where(eq(this.table.id, id))
        .returning();

      if (!funcionario) throw new NotFoundException('Cadastro not found');

      return { funcionario };
    });
  }

  async remove(id: string) {
    const where = eq(this.table.id, id);

    const [deleted] = await this.db.delete(this.table).where(where).returning();
    if (!deleted) throw new NotFoundException('Funcionario not found');
    return deleted;
  }

  private withCalculatedFields() {
    const { salario } = this.table;
    return {
      decimoTerceiro: sql<number>`${salario} / 12`,
      ferias: sql<number>`${salario} / 9`,
    };
  }
}
