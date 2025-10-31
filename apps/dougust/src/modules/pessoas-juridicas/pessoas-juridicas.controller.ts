import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PessoasJuridicasService } from './pessoas-juridicas.service';
import { CreatePessoaJuridicaDto } from './dto/create-pessoa-juridica.dto';
import { UpdatePessoaJuridicaDto } from './dto/update-pessoa-juridica.dto';

@Controller('pessoas-juridicas')
export class PessoasJuridicasController {
  constructor(private readonly service: PessoasJuridicasService) {}

  @Post()
  create(@Body() dto: CreatePessoaJuridicaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('businessId') businessId?: string) {
    return this.service.findAll(businessId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('businessId') businessId?: string) {
    return this.service.findOne(id, businessId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePessoaJuridicaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('businessId') businessId?: string) {
    return this.service.remove(id, businessId);
  }
}
