import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}
  @Get()
  @ApiOkResponse({
    description: 'Application and PostgreSQL are available',
    schema: {
      example: {
        statusCode: 200,
        data: { status: 'ok', database: 'connected' },
      },
    },
  })
  @ApiServiceUnavailableResponse({ description: 'PostgreSQL is unavailable' })
  check(): Promise<{ status: string; database: string }> {
    return this.health.check();
  }
}
