import { Module } from '@nestjs/common';
import { PessoasJuridicasService } from './pessoas-juridicas.service';
import { PessoasJuridicasController } from './pessoas-juridicas.controller';
import { DrizzleModule } from '../database/database.module';
import { UserContextModule } from '../../common/user-context/user-context.module';

@Module({
  imports: [DrizzleModule, UserContextModule],
  controllers: [PessoasJuridicasController],
  providers: [PessoasJuridicasService],
  exports: [PessoasJuridicasService],
})
export class PessoasJuridicasModule {}
