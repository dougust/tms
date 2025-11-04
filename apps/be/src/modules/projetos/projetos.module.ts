import { Module } from '@nestjs/common';
import { ProjetosService } from './projetos.service';
import { ProjetosController } from './projetos.controller';
import { DrizzleModule } from '../database/database.module';
import { UserContextModule } from '../../common/user-context/user-context.module';
import { DatabaseUtilsModule } from '../../common/cadastros/database-utils.module';

@Module({
  imports: [DrizzleModule, UserContextModule, DatabaseUtilsModule],
  controllers: [ProjetosController],
  providers: [ProjetosService],
  exports: [ProjetosService],
})
export class ProjetosModule {}
