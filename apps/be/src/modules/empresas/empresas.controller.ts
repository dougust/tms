import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { CreateEmpresaResultDto } from './dto/create-empresa.result.dto';
import { EmpresaDto, GetEmpresaResponseDto } from './dto/get-empresa.response.dto';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly service: EmpresasService) {}

  @Post()
  create(@Body() dto: CreateEmpresaDto): Promise<CreateEmpresaResultDto> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<EmpresaDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<GetEmpresaResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmpresaDto
  ): Promise<CreateEmpresaResultDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
