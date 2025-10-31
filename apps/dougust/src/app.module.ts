import { Module } from '@nestjs/common';
import { DrizzleModule } from './modules/database/database.module';
import { PessoasJuridicasModule } from './modules/pessoas-juridicas/pessoas-juridicas.module';

@Module({
  imports: [DrizzleModule, PessoasJuridicasModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
