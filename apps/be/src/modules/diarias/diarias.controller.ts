import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { DiariasService } from './diarias.service';
import { RangeQueryDto } from './dto/range-query.dto';
import { IDiariaFuncionarioResultDto } from '@dougust/types';

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

  @Patch()
  updateDiaria(@Body() body) {
    return this.service.updateDiaria(body);
  }
}
