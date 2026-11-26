import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}
  async check(): Promise<{ status: string; database: string }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', database: 'connected' };
    } catch {
      throw new ServiceUnavailableException({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database connection is unavailable',
        details: { database: 'disconnected' },
      });
    }
  }
}
