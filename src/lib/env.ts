import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  APP_URL: z.string().url().optional(),
  STORAGE_PATH: z.string().min(1).optional(),
});

let _env: z.infer<typeof schema> | null = null;

export function getEnv() {
  if (_env) return _env;
  _env = schema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    APP_URL: process.env.APP_URL,
    STORAGE_PATH: process.env.STORAGE_PATH,
  });
  return _env;
}


