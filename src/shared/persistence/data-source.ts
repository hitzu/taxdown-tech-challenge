import { DataSource } from "typeorm";
import * as path from "path";
import { DB_SCHEMA, DB_URL } from "./db-config";

const stage = process.env.NODE_ENV || "local";
const isTest = stage === "test";
const isProduction = stage === "production" || stage === "prod";

const url = DB_URL;

if (!url || typeof url !== "string") {
  throw new Error(
    `DB_URL environment variable is required but was not found or is not a string. ` +
      `Please set DB_URL in your .env.${stage} file. ` +
      `Example: postgresql://postgres:postgres@localhost:5432/database_name`
  );
}

export const AppDataSource = new DataSource({
  type: "postgres" as const,
  url: url as string,
  schema: DB_SCHEMA,
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
  synchronize: isTest,
  logging: false,
  dropSchema: isTest,

  entities: [path.join(__dirname, "../../**/*.orm-entity{.ts,.js}")],

  migrations: isTest
    ? []
    : [path.join(__dirname, "./migrations/**/*{.ts,.js}")],

  subscribers: [],

  poolSize: isProduction ? 20 : 5,

  extra: {
    max: isProduction ? 20 : 5,
    connectionTimeoutMillis: isProduction ? 10000 : 2000,
    idleTimeoutMillis: 30000,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    // Set PostgreSQL search_path to use the specified schema
    options: `-c search_path=${DB_SCHEMA}`,
  },
});
