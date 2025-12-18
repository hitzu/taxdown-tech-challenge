import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766016220440 implements MigrationInterface {
  name = "Migration1766016220440";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasCustomersTable = await queryRunner.hasTable("customers");
    if (!hasCustomersTable) {
      await queryRunner.query(
        `CREATE TABLE "customers" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "phone_number" character varying(255) NOT NULL, "available_credit" numeric NOT NULL, CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`
      );
    }

    // QueryRunner doesn't expose `hasIndex` in this repo's TypeORM types; use a Postgres-safe guard instead.
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "idx_unique_email_phone_number" ON "customers" ("email", "phone_number")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Use IF EXISTS so a partially-applied or baseline DB can still revert safely.
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_unique_email_phone_number"`
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "customers"`);
  }
}
