import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Cargar variables de entorno ANTES de que se importen las entidades
const stage = process.env.NODE_ENV || "local";
const envPath = path.join(__dirname, "../../../", `.env.${stage}`);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export const DB_SCHEMA = process.env.DB_SCHEMA ?? "public";
export const DB_URL = process.env.DB_URL;
