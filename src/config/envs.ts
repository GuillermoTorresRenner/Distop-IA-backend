import 'dotenv/config';
import * as joi from 'joi';
/* eslint-disable */

interface EnvVars {
  PORT: number;
  JWT_SECRET: string;
  NODE_ENV: string;
  DATABASE_URL: string;
  FRONTEND_URL: string;
  BACKEND_URL: string;
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_USER: string;
  MAIL_PASSWORD: string;
  MAIL_FROM: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    JWT_SECRET: joi.string().required(),
    NODE_ENV: joi.string().valid('dev', 'qa', 'production', 'test').required(),
    DATABASE_URL: joi.string().required(),
    BACKEND_URL: joi.string().uri().optional(),
    FRONTEND_URL: joi.string().uri().optional(),
    MAIL_HOST: joi.string().optional(),
    MAIL_PORT: joi.number().optional(),
    MAIL_USER: joi.string().optional(),
    MAIL_PASSWORD: joi.string().optional(),
    MAIL_FROM: joi.string().optional(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  jwtSecret: envVars.JWT_SECRET,
  nodeEnv: envVars.NODE_ENV,
  databaseUrl: envVars.DATABASE_URL,
  frontendUrl: envVars.FRONTEND_URL,
  backendUrl: envVars.BACKEND_URL,
  mailHost: envVars.MAIL_HOST,
  mailPort: envVars.MAIL_PORT,
  mailUser: envVars.MAIL_USER,
  mailPassword: envVars.MAIL_PASSWORD,
  mailFrom: envVars.MAIL_FROM,
};
