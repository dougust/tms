import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DrizzleModule } from '../database/database.module';

@Module({
  imports: [DrizzleModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
