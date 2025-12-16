export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  http: {
    port: parseInt(process.env.PORT ?? '3000', 10)
  },
  database: {
    // Prefer generic DB_URL (local/dev and future deployments), but keep a fallback for Supabase naming.
    url: process.env.DB_URL ?? process.env.SUPABASE_DB_URL ?? '',
    // default to 'public' so anyone can use a fresh Postgres instance without custom schemas
    schema: process.env.DB_SCHEMA ?? 'public'
  }
});


