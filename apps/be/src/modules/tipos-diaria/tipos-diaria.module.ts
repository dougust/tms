import { Module } from '@nestjs/common';
import { TiposDiariaService } from './tipos-diaria.service';
import { TiposDiariaController } from './tipos-diaria.controller';
import { DrizzleModule } from '../database/database.module';
import { UserContextModule } from '../../common/user-context/user-context.module';

@Module({
  imports: [DrizzleModule, UserContextModule],
  controllers: [TiposDiariaController],
  providers: [TiposDiariaService],
  exports: [TiposDiariaService],
})
export class TiposDiariaModule {}
