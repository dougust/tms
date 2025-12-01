import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../../common';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  async getHealth() {
    const started = Date.now();
    const db = await this.healthService.checkDatabase();
    const userContext =
      await this.healthService.getCurrentlyRunningBusinessId();
    return {
      userContext,
      status: db.status === 'up' ? 'ok 5' : 'degraded 5',
      uptime: process.uptime(),
      responseTimeMs: Date.now() - started,
      timestamp: new Date().toISOString(),
      db,
    };
  }
}
