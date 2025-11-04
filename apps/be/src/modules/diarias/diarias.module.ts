import { Module } from '@nestjs/common';
import { DrizzleModule } from '../database/database.module';
import { UserContextModule } from '../../common/user-context/user-context.module';
import { DatabaseUtilsModule } from '../../common/cadastros/database-utils.module';
import { DiariasController } from './diarias.controller';
import { DiariasService } from './diarias.service';

@Module({
  imports: [DrizzleModule, UserContextModule, DatabaseUtilsModule],
  controllers: [DiariasController],
  providers: [DiariasService],
  exports: [DiariasService],
})
export class DiariasModule {}
