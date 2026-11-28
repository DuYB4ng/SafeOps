import Joi from 'joi';

export interface Environment {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_TTL: string;
  JWT_REFRESH_TTL: string;
  ALERT_API_KEY: string;
  CORS_ORIGIN: string;
  UPLOAD_DIR: string;
  SLA_CHECK_INTERVAL_SECONDS: number;
}
const schema = Joi.object<Environment>({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().min(1).default(3001),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).invalid(Joi.ref('JWT_ACCESS_SECRET')).required(),
  JWT_ACCESS_TTL: Joi.string()
    .pattern(/^[1-9]\d*[smhd]$/)
    .default('15m'),
  JWT_REFRESH_TTL: Joi.string()
    .pattern(/^[1-9]\d*[smhd]$/)
    .default('7d'),
  ALERT_API_KEY: Joi.string().min(32).required(),
  CORS_ORIGIN: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  UPLOAD_DIR: Joi.string().default('uploads'),
  SLA_CHECK_INTERVAL_SECONDS: Joi.number().integer().min(1).default(30),
});
export function validate(config: Record<string, unknown>): Environment {
  const result = schema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
  });
  const { error } = result;
  if (error) {
    throw new Error(
      'Environment validation failed: ' + error.details.map((detail) => detail.message).join('; '),
    );
  }
  return result.value;
}
