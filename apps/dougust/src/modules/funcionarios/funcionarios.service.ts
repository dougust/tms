import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { cadastros, funcionarios } from '@dougust/database';
import { eq } from 'drizzle-orm';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { UserContextService } from '../../common/user-context/user-context.service';

@Injectable()
export class FuncionariosService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    @Inject() private readonly userContext: UserContextService
  ) {}

  get table() {
    return funcionarios(this.userContext.businessId);
  }

  get cadastrosTable() {
    return cadastros(this.userContext.businessId);
  }

  async create(dto: CreateFuncionarioDto) {
    return await this.db.transaction(async (tx) => {
      // First create the cadastro
      const [cadastro] = await tx
        .insert(this.cadastrosTable)
        .values({
          nomeRazao: dto.nome ?? null,
          socialFantasia: dto.social ?? null,
          cpfCnpj: dto.cpf,
          nascimentoRegistro: dto.nascimento ?? null,
          phone: dto.phone ?? null,
          email: dto.email,
          rg: dto.rg ?? null,
        })
        .returning();

      // Then create the funcionario linked to the cadastro
      const [funcionario] = await tx
        .insert(this.table)
        .values({
          id: cadastro.id,
        })
        .returning();

      return {
        ...funcionario,
        cadastro,
      };
    });
  }

  async findAll() {
    const query = this.db
      .select({
        funcionario: this.table,
        cadastro: this.cadastrosTable,
      })
      .from(this.table)
      .leftJoin(this.cadastrosTable, eq(this.table.id, this.cadastrosTable.id));

    return query;
  }

  async findOne(id: string) {
    const where = eq(this.table.id, id);

    const result = await this.db
      .select({
        funcionario: this.table,
        cadastro: this.cadastrosTable,
      })
      .from(this.table)
      .leftJoin(this.cadastrosTable, eq(this.table.id, this.cadastrosTable.id))
      .where(where)
      .limit(1);

    const entity = result[0];
    if (!entity) throw new NotFoundException('Funcionario not found');
    return entity;
  }

  async update(id: string, dto: UpdateFuncionarioDto) {
    return await this.db.transaction(async (tx) => {
      // Update cadastro if any cadastro fields are provided
      if (
        dto.nome !== undefined ||
        dto.social !== undefined ||
        dto.cpf !== undefined ||
        dto.nascimento !== undefined ||
        dto.phone !== undefined ||
        dto.email !== undefined ||
        dto.rg !== undefined
      ) {
        const [cadastro] = await tx
          .update(this.cadastrosTable)
          .set({
            nomeRazao: dto.nome ?? undefined,
            socialFantasia: dto.social ?? undefined,
            cpfCnpj: dto.cpf ?? undefined,
            nascimentoRegistro: dto.nascimento ?? undefined,
            phone: dto.phone ?? undefined,
            email: dto.email ?? undefined,
            rg: dto.rg ?? undefined,
            updatedAt: new Date(),
          })
          .where(eq(this.cadastrosTable.id, id))
          .returning();

        if (!cadastro) throw new NotFoundException('Cadastro not found');
      }

      // Update funcionario
      const [funcionario] = await tx
        .update(this.table)
        .set({
          updatedAt: new Date(),
        })
        .where(eq(this.table.id, id))
        .returning();

      if (!funcionario) throw new NotFoundException('Funcionario not found');

      // Fetch the updated cadastro to return complete data
      const [cadastro] = await tx
        .select()
        .from(this.cadastrosTable)
        .where(eq(this.cadastrosTable.id, id))
        .limit(1);

      return {
        ...funcionario,
        cadastro,
      };
    });
  }

  async remove(id: string) {
    const where = eq(this.table.id, id);

    const [deleted] = await this.db.delete(this.table).where(where).returning();
    if (!deleted) throw new NotFoundException('Funcionario not found');
    return deleted;
  }
}
