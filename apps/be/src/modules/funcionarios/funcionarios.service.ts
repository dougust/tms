import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { funcionarios, IFuncionarioTable } from '@dougust/database';
import { eq, getTableColumns, sql } from 'drizzle-orm';
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

  async create(dto: CreateFuncionarioDto) {
    const [funcionario] = await this.db
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
        funcao: dto.funcao ?? null,
        dependetes: dto.dependetes ?? null,
      })
      .returning();

    return { funcionario };
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
          funcao: dto.funcao ?? null,
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
