import { Controller, Get } from '@nestjs/common';
import { TiposDiariaService } from './tipos-diaria.service';
import { TipoDiariaDto } from './dto/tipo-diaria.dto';

@Controller('tipos-diarias')
export class TiposDiariaController {
  constructor(private readonly service: TiposDiariaService) {}

  @Get()
  findAll(): Promise<TipoDiariaDto[]> {
    return this.service.findAll();
  }
}
