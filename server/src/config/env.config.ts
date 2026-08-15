import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z
    .string({ required_error: 'MONGODB_URI is required' })
    .default('mongodb://localhost:27017/workflow_rbac'),
  JWT_SECRET: z.string().default('workflow_super_secret_jwt_key_change_in_production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment configuration:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const config = {
  port: parseInt(_env.data.PORT, 10),
  env: _env.data.NODE_ENV,
  mongoUri: _env.data.MONGODB_URI,
  jwtSecret: _env.data.JWT_SECRET,
  jwtExpiresIn: _env.data.JWT_EXPIRES_IN,
  clientUrl: _env.data.CLIENT_URL,
};
