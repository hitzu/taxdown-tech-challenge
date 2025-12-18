import { AppDataSource as TestDataSource } from "../src/shared/persistence/data-source";

// Global flag to prevent multiple initializations across test suites
declare global {
  var __TEST_DB_INITIALIZED__: boolean | undefined;
}

// Set JWT_SECRET for tests if not already set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-jwt-secret-for-unit-tests";
}

beforeAll(async () => {
  if (!global.__TEST_DB_INITIALIZED__ && !TestDataSource.isInitialized) {
    try {
      await TestDataSource.initialize();
      global.__TEST_DB_INITIALIZED__ = true;
    } catch (error) {
      // If initialization fails (e.g., deadlock), wait a bit and retry once
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("deadlock")) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!TestDataSource.isInitialized) {
          await TestDataSource.initialize();
          global.__TEST_DB_INITIALIZED__ = true;
        }
      } else {
        throw error;
      }
    }
  }
}, 30000); // Increase timeout to 30 seconds

afterAll(async () => {
  // Only destroy if this is the last test suite
  // Note: In parallel execution, this might not be perfect, but it's better than nothing
  if (TestDataSource.isInitialized && global.__TEST_DB_INITIALIZED__) {
    try {
      await TestDataSource.destroy();
      global.__TEST_DB_INITIALIZED__ = false;
    } catch (error) {
      // Ignore errors during cleanup
      console.error("Error destroying test database:", error);
    }
  }
});

afterEach(async () => {
  if (!TestDataSource.isInitialized) return;

  const queryRunner = TestDataSource.createQueryRunner();

  try {
    try {
      await queryRunner.query("SET session_replication_role = replica;");
    } catch {
      // ignore
    }

    const entities = TestDataSource.entityMetadatas;

    for (const entity of entities) {
      const tableName = entity.tableName;
      const schema = (entity as any).schema as string | undefined;

      const qualified = schema
        ? `"${schema}"."${tableName}"`
        : `"${tableName}"`;

      await queryRunner.query(
        `TRUNCATE TABLE ${qualified} RESTART IDENTITY CASCADE;`
      );
    }

    try {
      await queryRunner.query("SET session_replication_role = DEFAULT;");
    } catch {
      // ignore
    }
  } finally {
    await queryRunner.release();
  }
});
