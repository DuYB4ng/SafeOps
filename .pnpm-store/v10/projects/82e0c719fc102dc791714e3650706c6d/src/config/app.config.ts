import { registerAs } from '@nestjs/config';
export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: process.env.CORS_ORIGIN,
  uploadDir: process.env.UPLOAD_DIR,
  slaCheckIntervalSeconds: Number(process.env.SLA_CHECK_INTERVAL_SECONDS ?? 30),
}));
