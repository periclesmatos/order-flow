import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';

export const E2E_PRISMA_HEALTH = 'E2E_PRISMA_HEALTH';

export interface E2ePrismaHealthIndicator {
  isHealthy(key: string): Promise<Record<string, { status: 'up' | 'down' }>>;
}

@Controller('health')
@SkipThrottle()
export class E2eHealthController {
  constructor(
    private readonly health: HealthCheckService,
    @Inject(E2E_PRISMA_HEALTH)
    private readonly prismaHealth: E2ePrismaHealthIndicator,
  ) {}

  @Get()
  liveness(): { status: string } {
    return { status: 'ok' };
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([() => this.prismaHealth.isHealthy('database')]);
  }
}
