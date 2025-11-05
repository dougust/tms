import { Module } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { EmpresasController } from './empresas.controller';
import { DrizzleModule } from '../database/database.module';
import { UserContextModule } from '../../common/user-context/user-context.module';
import { DatabaseUtilsModule } from '../../common/cadastros/database-utils.module';

@Module({
  imports: [DrizzleModule, UserContextModule, DatabaseUtilsModule],
  controllers: [EmpresasController],
  providers: [EmpresasService],
  exports: [EmpresasService],
})
export class EmpresasModule {}
