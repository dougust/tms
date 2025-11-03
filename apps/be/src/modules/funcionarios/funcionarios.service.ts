import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { funcionarios, IFuncionario } from '@dougust/database';
import { eq } from 'drizzle-orm';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { UserContextService } from '../../common/user-context/user-context.service';
import { PaginatedResponse } from '../../common/types';

@Injectable()
export class FuncionariosService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    @Inject() private readonly userContext: UserContextService
  ) {}

  get table() {
    return funcionarios(this.userContext.businessId);
  }

  async create(dto: CreateFuncionarioDto) {
    return await this.db.transaction(async (tx) => {
      // Then create the funcionario linked to the cadastro
      const [funcionario] = await tx
        .insert(this.table)
        .values({
          nome: dto.nome ?? null,
          social: dto.social ?? null,
          cpf: dto.cpf,
          nascimento: dto.nascimento ?? null,
          phone: dto.phone ?? null,
          email: dto.email,
          rg: dto.rg ?? null,
        })
        .returning();

      return { funcionario };
    });
  }

  async findAll() {
    return await this.db.select().from(this.table);
  }

  async findOne(id: string) {
    const where = eq(this.table.id, id);

    const result = await this.db
      .select({ funcionario: this.table })
      .from(this.table)
      .where(where)
      .limit(1);

    const entity = result[0];
    if (!entity) throw new NotFoundException('Funcionario not found');
    return entity;
  }

  async update(id: string, dto: UpdateFuncionarioDto) {
    return await this.db.transaction(async (tx) => {
      // Update cadastro if any cadastro fields are provided
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
}
