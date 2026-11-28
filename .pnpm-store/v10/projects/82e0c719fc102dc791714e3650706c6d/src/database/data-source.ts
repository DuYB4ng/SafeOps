import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { validate } from '../config/env.validation';
import { databaseOptions } from '../config/database.config';

const env = validate(process.env);
export default new DataSource({
  ...databaseOptions(env.DATABASE_URL),
  synchronize: false,
});
