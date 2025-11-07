import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DiariasService } from './diarias.service';
import { RangeQueryDto } from './dto/range-query.dto';
import { CreateDiariaDto } from './dto/create-diaria.dto';
import { DiariaDto } from './dto/diaria.dto';
import { CreateManyDiariasDto } from './dto/create-many-diarias.dto';

@Controller('diarias')
export class DiariasController {
  constructor(private readonly service: DiariasService) {}

  @Get()
  findInRange(
    @Query()
    query: RangeQueryDto
  ): Promise<DiariaDto[]> {
    return this.service.findInRange(query);
  }

  @Post()
  create(@Body() dto: CreateDiariaDto): Promise<DiariaDto> {
    return this.service.create(dto);
  }

  @Post('bulk')
  createMany(@Body() payload: CreateManyDiariasDto): Promise<DiariaDto[]> {
    return this.service.createMany(payload);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateDiariaDto
  ): Promise<DiariaDto> {
    return this.service.update(id, dto);
  }
}
