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
import { IDiariaFuncionarioResultDto } from '@dougust/types';
import { CreateDiariaDto } from './dto/create-diaria.dto';

@Controller('diarias')
export class DiariasController {
  constructor(private readonly service: DiariasService) {}

  @Get()
  findInRange(
    @Query()
    query: RangeQueryDto
  ): Promise<IDiariaFuncionarioResultDto> {
    return this.service.findInRange(query);
  }

  @Post()
  create(@Body() dto: CreateDiariaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateDiariaDto) {
    return this.service.update(id, dto);
  }
}
