import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import { LookupsService } from './lookups.service';
import { CreateLookupDto } from './dto/create-lookup.dto';
import { UpdateLookupDto } from './dto/update-lookup.dto';
import { LookupDto } from './dto/lookup.dto';

@Controller('lookups')
export class LookupsController {
  constructor(private readonly service: LookupsService) {}

  @Post()
  create(@Body() dto: CreateLookupDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<LookupDto[]> {
    return this.service.findAll();
  }

  @Get(':grupo')
  findByGroup(@Param('grupo') grupo: string): Promise<LookupDto[]> {
    return this.service.findByGroup(grupo);
  }

  @Get(':grupo/:key')
  async findOne(
    @Param('grupo') grupo: string,
    @Param('key', new ParseIntPipe()) key: number
  ): Promise<{ lookup: LookupDto }> {
    return this.service.findOne(grupo, key);
  }

  @Patch(':grupo/:key')
  update(
    @Param('grupo') grupo: string,
    @Param('key', new ParseIntPipe()) key: number,
    @Body() dto: UpdateLookupDto
  ) {
    return this.service.update(grupo, key, dto);
  }

  @Delete(':grupo/:key')
  remove(
    @Param('grupo') grupo: string,
    @Param('key', new ParseIntPipe()) key: number
  ) {
    return this.service.remove(grupo, key);
  }
}
