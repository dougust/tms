import { Module } from '@nestjs/common';
import LookupsService from './lookups.service';
import { LookupsController } from './lookups.controller';
import { DrizzleModule } from '../database/database.module';

@Module({
  imports: [DrizzleModule],
  controllers: [LookupsController],
  providers: [LookupsService],
  exports: [LookupsService],
})
export class LookupsModule {}
