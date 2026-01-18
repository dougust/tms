import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth() {
    const started = Date.now();
    const db = await this.healthService.checkDatabase();
    return {
      status: db.status === 'up' ? 'ok' : 'degraded',
      uptime: process.uptime(),
      responseTimeMs: Date.now() - started,
      timestamp: new Date().toISOString(),
      db,
    };
  }
}
