import { registerAs } from '@nestjs/config';
import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';

export function databaseOptions(url: string): DataSourceOptions {
  return {
    type: 'postgres',
    url,
    entities: [join(__dirname, '..', 'modules', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
    synchronize: false,
    migrationsRun: false,
    logging: false,
    connectTimeoutMS: 5000,
    extra: { statement_timeout: 5000, query_timeout: 5000 },
  };
}
export default registerAs('database', () => databaseOptions(process.env.DATABASE_URL!));
