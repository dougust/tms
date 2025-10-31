import { Module } from '@nestjs/common';
import { PessoasJuridicasService } from './pessoas-juridicas.service';
import { PessoasJuridicasController } from './pessoas-juridicas.controller';
import { DrizzleModule } from '../database/database.module';

@Module({
  imports: [DrizzleModule],
  controllers: [PessoasJuridicasController],
  providers: [PessoasJuridicasService],
  exports: [PessoasJuridicasService],
})
export class PessoasJuridicasModule {}
