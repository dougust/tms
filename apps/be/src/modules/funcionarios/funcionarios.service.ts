import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { funcionarios, beneficios, lookup } from '@dougust/database';
import { and, eq, inArray } from 'drizzle-orm';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

@Injectable()
export class FuncionariosService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>
  ) {}

  async create(dto: CreateFuncionarioDto) {
    return await this.db.transaction(async (tx) => {
      let funcaoId: string | null = null;
      const funcaoNome = (dto.funcao ?? '').trim();
      if (funcaoNome) {
        const funcaoLookup = await tx.query.lookup.findFirst({
          where: and(eq(lookup.grupo, 'Funcao'), eq(lookup.nome, funcaoNome)),
          columns: { id: true },
        });

        if (!funcaoLookup) {
          throw new NotFoundException(`Lookup não encontrado para função: ${funcaoNome}`);
        }
        funcaoId = funcaoLookup.id as unknown as string;
      }

      const [funcionario] = await tx
        .insert(funcionarios)
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
        const found = await tx.query.lookup.findMany({
          where: and(eq(lookup.grupo, 'beneficios'), inArray(lookup.id, ids)),
          columns: { id: true },
        });

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
        await tx.insert(beneficios).values(benefitRows);
      }

      return { funcionario };
    });
  }

  async findAll() {
    return this.db.query.funcionarios.findMany({
      columns: {
        id: true,
        nome: true,
        social: true,
        cpf: true,
        nascimento: true,
        phone: true,
        email: true,
        rg: true,
        funcao: true,
        salario: true,
        dependetes: true,
        projetoId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const entity = await this.db.query.funcionarios.findFirst({
      where: eq(funcionarios.id, id),
      columns: {
        id: true,
        nome: true,
        social: true,
        cpf: true,
        nascimento: true,
        phone: true,
        email: true,
        rg: true,
        funcao: true,
        salario: true,
        dependetes: true,
        projetoId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

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
          const funcaoLookup = await tx.query.lookup.findFirst({
            where: and(eq(lookup.grupo, 'Funcao'), eq(lookup.nome, funcaoNome)),
            columns: { id: true },
          });
          if (!funcaoLookup) {
            throw new NotFoundException(`Lookup não encontrado para função: ${funcaoNome}`);
          }
          funcaoUpdate = funcaoLookup.id as unknown as string;
        }
      }

      const [funcionario] = await tx
        .update(funcionarios)
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
        .where(eq(funcionarios.id, id))
        .returning();

      if (!funcionario) throw new NotFoundException('Cadastro not found');

      return { funcionario };
    });
  }

  async remove(id: string) {
    const [deleted] = await this.db
      .delete(funcionarios)
      .where(eq(funcionarios.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('Funcionario not found');
    return deleted;
  }
}
