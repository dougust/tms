import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { lookup } from '@dougust/database';
import { and, eq } from 'drizzle-orm';
import { CreateLookupDto } from './dto/create-lookup.dto';
import { UpdateLookupDto } from './dto/update-lookup.dto';

@Injectable()
class LookupsService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>
  ) {}

  async findAll() {
    return this.db.select().from(lookup);
  }

  async findByGroup(grupo: string) {
    return this.db.select().from(lookup).where(eq(lookup.grupo, grupo));
  }

  async findOne(grupo: string, id: string) {
    const where = and(eq(lookup.grupo, grupo), eq(lookup.id, id));
    const result = await this.db
      .select({ lookup })
      .from(lookup)
      .where(where)
      .limit(1);

    const entity = result[0];
    if (!entity) throw new NotFoundException('Lookup not found');
    return entity;
  }

  async create(dto: CreateLookupDto) {
    const [created] = await this.db
      .insert(lookup)
      .values({
        grupo: dto.grupo,
        nome: dto.nome,
      })
      .returning();

    return { lookup: created };
  }

  async update(grupo: string, id: string, dto: UpdateLookupDto) {
    const where = and(eq(lookup.grupo, grupo), eq(lookup.id, id));

    const [updated] = await this.db
      .update(lookup)
      .set({
        grupo: dto.grupo ?? undefined,
        nome: dto.nome ?? undefined,
        updatedAt: new Date(),
      })
      .where(where)
      .returning();

    if (!updated) throw new NotFoundException('Lookup not found');

    return { lookup: updated };
  }

  async remove(grupo: string, id: string) {
    const where = and(eq(lookup.grupo, grupo), eq(lookup.id, id));
    const [deleted] = await this.db.delete(lookup).where(where).returning();
    if (!deleted) throw new NotFoundException('Lookup not found');
    return deleted;
  }
}

export default LookupsService;
