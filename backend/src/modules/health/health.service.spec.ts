import { ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const query = jest.fn();
  const service = new HealthService({ query } as unknown as DataSource);
  beforeEach(() => query.mockReset());

  it('queries PostgreSQL before reporting connected', async () => {
    query.mockResolvedValue([{ '?column?': 1 }]);
    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      database: 'connected',
    });
    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  it('returns a safe 503 when PostgreSQL fails', async () => {
    query.mockRejectedValue(new Error('postgres://secret-password@private-host/db'));
    try {
      await service.check();
      throw new Error('Expected failure');
    } catch (error) {
      expect(error).toBeInstanceOf(ServiceUnavailableException);
      const exception = error as ServiceUnavailableException;
      expect(exception.getStatus()).toBe(503);
      expect(JSON.stringify(exception.getResponse())).not.toContain('secret-password');
    }
  });
});
