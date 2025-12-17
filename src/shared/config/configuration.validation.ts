import { plainToInstance, Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  validateSync,
} from "class-validator";

class EnvironmentVariables {
  @IsOptional()
  @IsIn(["local", "development", "test", "production"])
  NODE_ENV?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  PORT?: number;

  @IsOptional()
  @IsString()
  DB_URL?: string;

  @IsOptional()
  @IsString()
  DB_SCHEMA?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const normalizedConfig: Record<string, unknown> = {
    NODE_ENV: config.NODE_ENV ?? "development",
    ...config,
  };

  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    normalizedConfig,
    {
      enableImplicitConversion: true,
    }
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  // Require a DB URL only in production (dev/test can omit it at this stage).
  const env = String(normalizedConfig.NODE_ENV ?? "development");
  const dbUrl = (normalizedConfig.DB_URL ?? "").toString();
  if (env === "production" && dbUrl.length === 0) {
    throw new Error("DB_URL is required when NODE_ENV=production");
  }

  return normalizedConfig;
}
