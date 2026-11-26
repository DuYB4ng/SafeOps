import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './setup-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  const port = app.get(ConfigService).getOrThrow<number>('app.port');
  await app.listen(port, '0.0.0.0');
  Logger.log('Nest application listening on port ' + port, 'Bootstrap');
}
void bootstrap().catch(() => {
  Logger.error('Backend startup failed.', undefined, 'Bootstrap');
  process.exitCode = 1;
});
