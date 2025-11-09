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
import LookupsService from './lookups.service';
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

  @Get(':grupo/:id')
  async findOne(
    @Param('grupo') grupo: string,
    @Param('id', new ParseIntPipe()) id: string
  ): Promise<{ lookup: LookupDto }> {
    return this.service.findOne(grupo, id);
  }

  @Patch(':grupo/:id')
  update(
    @Param('grupo') grupo: string,
    @Param('id', new ParseIntPipe()) id: string,
    @Body() dto: UpdateLookupDto
  ) {
    return this.service.update(grupo, id, dto);
  }

  @Delete(':grupo/:id')
  remove(
    @Param('grupo') grupo: string,
    @Param('id', new ParseIntPipe()) id: string
  ) {
    return this.service.remove(grupo, id);
  }
}
