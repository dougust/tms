import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProjetosService } from './projetos.service';
import { CreateProjetoDto } from './dto/create-projeto.dto';
import { UpdateProjetoDto } from './dto/update-projeto.dto';
import { CreateProjetoResultDto } from './dto/create-projeto.result.dto';
import { ProjetoDto } from './dto/projeto.dto';

@Controller('projetos')
export class ProjetosController {
  constructor(private readonly service: ProjetosService) {}

  @Post()
  create(@Body() dto: CreateProjetoDto): Promise<CreateProjetoResultDto> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<ProjetoDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProjetoDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjetoDto
  ): Promise<CreateProjetoResultDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
