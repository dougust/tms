import { Controller, Get } from '@nestjs/common';
import { TiposDiariaService } from './tipos-diaria.service';

@Controller('tipos-diarias')
export class TiposDiariaController {
  constructor(private readonly service: TiposDiariaService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
