import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";

import { AppModule } from "../../src/app.module";
import { AppDataSource as TestDataSource } from "../../src/shared/persistence/data-source";
import { CustomerOrmEntity } from "../../src/customer/infrastructure/persistence/customer.orm-entity";
import { CustomerFactory } from "../factories/customer.factory";

describe("Customers E2E", () => {
  let app: INestApplication;
  let factory: CustomerFactory;

  beforeAll(async () => {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    await TestDataSource.runMigrations();

    factory = new CustomerFactory(TestDataSource);

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("/api");
    await app.init();
  });

  it("POST /api/customers should create a customer", async () => {
    const generated = await factory.make();

    // Phone number must satisfy domain E.164 regex: /^\+?[1-9]\d{1,14}$/
    // Factory uses faker national format in some setups, so we override to a known-valid value.
    const payload = {
      name: generated.name,
      email: generated.email,
      phoneNumber: "+512221101495",
      initialAvailableCredit: Math.max(
        1,
        Number(generated.availableCredit) || 1
      ),
    };

    const res = await request(app.getHttpServer())
      .post("/api/customers")
      .set("content-type", "application/json")
      .send(payload)
      .expect(201);

    // Controller returns void on success
    expect(res.text).toBe("");
    expect(res.body).toEqual({});

    const repo = TestDataSource.getRepository(CustomerOrmEntity);
    const persisted = await repo.findOne({ where: { email: payload.email } });

    expect(persisted).toBeTruthy();
    expect(persisted!.id).toBeGreaterThan(0);
    expect(persisted!.name).toBe(payload.name);
    expect(persisted!.email).toBe(payload.email);
    expect(persisted!.phoneNumber).toBe(payload.phoneNumber);
    expect(Number(persisted!.availableCredit)).toBe(
      payload.initialAvailableCredit
    );
    expect(persisted!.createdAt).toBeInstanceOf(Date);
    expect(persisted!.updatedAt).toBeInstanceOf(Date);
    expect(persisted!.deletedAt).toBeNull();
  });

  afterAll(async () => {
    await app.close();
  });
});
