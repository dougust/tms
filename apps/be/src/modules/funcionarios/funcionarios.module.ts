import { Module } from '@nestjs/common';
import { FuncionariosService } from './funcionarios.service';
import { FuncionariosController } from './funcionarios.controller';
import { DrizzleModule } from '../database/database.module';
import { DatabaseUtilsModule } from '../../common/cadastros/database-utils.module';

@Module({
  imports: [DrizzleModule, DatabaseUtilsModule],
  controllers: [FuncionariosController],
  providers: [FuncionariosService],
  exports: [FuncionariosService],
})
export class FuncionariosModule {}
