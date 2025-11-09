import { Module } from '@nestjs/common';
import { LookupsService } from './lookups.service';
import { LookupsController } from './lookups.controller';
import { DrizzleModule } from '../database/database.module';
import { UserContextModule } from '../../common/user-context/user-context.module';

@Module({
  imports: [DrizzleModule, UserContextModule],
  controllers: [LookupsController],
  providers: [LookupsService],
  exports: [LookupsService],
})
export class LookupsModule {}
