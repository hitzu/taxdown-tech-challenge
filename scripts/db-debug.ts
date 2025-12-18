import "reflect-metadata";

import { AppDataSource } from "../src/shared/persistence/data-source";

async function main() {
  const targetSchema = process.env.DB_SCHEMA ?? "";
  console.log("[db:debug] NODE_ENV =", process.env.NODE_ENV);
  console.log("[db:debug] DB_URL set =", !!process.env.DB_URL);
  console.log("[db:debug] DB_SCHEMA =", targetSchema || "(empty)");

  await AppDataSource.initialize();
  try {
    const rows = await AppDataSource.query(
      `select current_schema() as current_schema, current_setting('search_path') as search_path`
    );
    console.log("[db:debug] connection:", rows?.[0] ?? rows);

    if (targetSchema) {
      const schemaExists = await AppDataSource.query(
        `select exists(select 1 from information_schema.schemata where schema_name = $1) as exists`,
        [targetSchema]
      );
      console.log(
        "[db:debug] schema exists:",
        schemaExists?.[0]?.exists ?? schemaExists
      );

      const tableRegclass = await AppDataSource.query(
        `select to_regclass($1) as regclass`,
        [`${targetSchema}.customers`]
      );
      console.log(
        "[db:debug] customers regclass:",
        tableRegclass?.[0]?.regclass ?? tableRegclass
      );
    }
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error("[db:debug] error:", err);
  process.exit(1);
});


