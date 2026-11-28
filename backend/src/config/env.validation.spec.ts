import { validate } from './env.validation';
import { databaseOptions } from './database.config';

const valid = {
  POSTGRES_USER: 'safeops',
  POSTGRES_PASSWORD: 'test',
  POSTGRES_DB: 'safeops',
  DATABASE_URL: 'postgres://safeops:test@localhost:5432/safeops',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
  ALERT_API_KEY: 'c'.repeat(32),
  CORS_ORIGIN: 'http://localhost:3000',
};
describe('Environment configuration', () => {
  it('normalizes numbers and defaults', () => {
    expect(validate({ ...valid, PORT: '3001' })).toMatchObject({
      PORT: 3001,
      JWT_ACCESS_TTL: '15m',
      SLA_CHECK_INTERVAL_SECONDS: 30,
    });
  });
  it('fails fast with missing keys', () => {
    expect(() => validate({})).toThrow('DATABASE_URL');
  });
  it('rejects invalid ports, URLs and duplicate secrets', () => {
    expect(() => validate({ ...valid, PORT: '65536' })).toThrow('PORT');
    expect(() => validate({ ...valid, DATABASE_URL: 'http://localhost' })).toThrow('DATABASE_URL');
    expect(() => validate({ ...valid, JWT_REFRESH_SECRET: valid.JWT_ACCESS_SECRET })).toThrow(
      'JWT_REFRESH_SECRET',
    );
  });
  it('keeps schema changes disabled', () => {
    expect(databaseOptions(valid.DATABASE_URL)).toMatchObject({
      synchronize: false,
      migrationsRun: false,
    });
  });
});
