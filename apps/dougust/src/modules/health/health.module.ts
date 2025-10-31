import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DrizzleModule } from '../database/database.module';
import { UserContextModule } from '../../common/user-context/user-context.module';

@Module({
  imports: [DrizzleModule, UserContextModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
