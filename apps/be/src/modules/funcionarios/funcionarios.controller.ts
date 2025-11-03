import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FuncionariosService } from './funcionarios.service';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import {
  FuncionarioDto,
  GetFuncionarioResponseDto,
} from './dto/get-funcionario.response.dto';
import { CreateFuncionarioResultDto } from './dto/create-funcionario.result.dto';
import { PaginatedResponse } from '../../common/types';

@Controller('funcionarios')
export class FuncionariosController {
  constructor(private readonly service: FuncionariosService) {}

  @Post()
  create(
    @Body() dto: CreateFuncionarioDto
  ): Promise<CreateFuncionarioResultDto> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<PaginatedResponse<FuncionarioDto>> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<GetFuncionarioResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFuncionarioDto
  ): Promise<CreateFuncionarioResultDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
