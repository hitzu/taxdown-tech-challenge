export default () => ({
  env: process.env.NODE_ENV ?? "development",
  http: {
    port: parseInt(process.env.PORT ?? "3000", 10),
  },
  database: {
    url: process.env.DB_URL ?? "",
    schema: process.env.DB_SCHEMA ?? "public",
  },
});
