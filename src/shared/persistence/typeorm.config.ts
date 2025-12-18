import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import * as path from "path";

export const getTypeOrmConfig = (): TypeOrmModuleOptions => {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const isProd = nodeEnv === "prod" || nodeEnv === "production";

  dotenv.config({
    path: path.resolve(process.cwd(), `.env.${nodeEnv}`),
  });

  const dbUrl = process.env.DB_URL ?? "";

  const schema = process.env.DB_SCHEMA ?? "public";

  return {
    type: "postgres",
    url: dbUrl,
    schema,
    autoLoadEntities: true,
    entities: [],
    migrations: [path.join(__dirname, "./migrations/**/*{.ts,.js}")],
    synchronize: false,
    logging: false,
    dropSchema: false,
    extra: {
      // Set PostgreSQL search_path to use the specified schema
      options: `-c search_path=${schema}`,
      ...(isProd && {
        max: 20,
        connectionTimeoutMillis: 2000,
      }),
    },

    ...(isProd && {
      ssl: { rejectUnauthorized: false },
      poolSize: 20,
    }),
  };
};
