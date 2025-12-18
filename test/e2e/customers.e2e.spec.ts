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

    const payload = {
      name: generated.name,
      email: generated.email,
      phoneNumber: "+512221101495",
      availableCredit: Math.max(1, Number(generated.availableCredit) || 1),
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
    const persisted = await repo.findOne({
      where: { email: payload.email, phoneNumber: payload.phoneNumber },
    });

    expect(persisted).toBeTruthy();
    expect(persisted!.id).toBeGreaterThan(0);
    expect(persisted!.name).toBe(payload.name);
    expect(persisted!.email).toBe(payload.email);
    expect(persisted!.phoneNumber).toBe(payload.phoneNumber);
    expect(Number(persisted!.availableCredit)).toBe(payload.availableCredit);
    expect(persisted!.createdAt).toBeInstanceOf(Date);
    expect(persisted!.updatedAt).toBeInstanceOf(Date);
    expect(persisted!.deletedAt).toBeNull();
  });

  it("POST /api/customers should fail when customer with same email and phone already exists", async () => {
    const generated = await factory.make();

    const payload = {
      name: generated.name,
      email: generated.email,
      phoneNumber: "+512221101495",
      availableCredit: Math.max(1, Number(generated.availableCredit) || 1),
    };

    await request(app.getHttpServer())
      .post("/api/customers")
      .set("content-type", "application/json")
      .send(payload)
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/customers")
      .set("content-type", "application/json")
      .send({
        ...payload,
        name: "Duplicate Jane",
      })
      .expect(409);
  });

  it("GET /api/customers/:id should return a customer", async () => {
    const generated = await factory.create();

    await request(app.getHttpServer())
      .get(`/api/customers/${generated.id}`)
      .expect(200);
  });

  it("GET /api/customers should return customers + total (contract)", async () => {
    await factory.create({
      name: "List A",
      email: "list.a@example.com",
      phoneNumber: "+34600110001",
      availableCredit: 10,
    });
    await factory.create({
      name: "List B",
      email: "list.b@example.com",
      phoneNumber: "+34600110002",
      availableCredit: 20,
    });

    const res = await request(app.getHttpServer())
      .get("/api/customers")
      .expect(200);

    expect(res.body).toHaveProperty("customers");
    expect(res.body).toHaveProperty("total");
    expect(Array.isArray(res.body.customers)).toBe(true);
    expect(typeof res.body.total).toBe("number");
    expect(res.body.total).toBe(2);
    expect(res.body.customers).toHaveLength(2);

    const first = res.body.customers[0];
    expect(first).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      email: expect.any(String),
      phoneNumber: expect.any(String),
      availableCredit: expect.any(Number),
      deletedAt: null,
    });
    expect(typeof first.createdAt).toBe("string");
    expect(typeof first.updatedAt).toBe("string");
  });

  it("GET /api/customers should sort by availableCredit asc", async () => {
    await factory.create({
      name: "S1",
      email: "sort.1@example.com",
      phoneNumber: "+34600110003",
      availableCredit: 30,
    });
    await factory.create({
      name: "S2",
      email: "sort.2@example.com",
      phoneNumber: "+34600110004",
      availableCredit: 10,
    });
    await factory.create({
      name: "S3",
      email: "sort.3@example.com",
      phoneNumber: "+34600110005",
      availableCredit: 20,
    });

    const res = await request(app.getHttpServer())
      .get(
        "/api/customers?sortBy=availableCredit&sortOrder=asc&page=1&pageSize=10"
      )
      .expect(200);

    expect(res.body.total).toBe(3);
    expect(res.body.customers.map((c: any) => c.availableCredit)).toEqual([
      10, 20, 30,
    ]);
  });

  it("GET /api/customers should paginate and keep total as unpaginated count", async () => {
    await factory.create({
      name: "P1",
      email: "page.1@example.com",
      phoneNumber: "+34600110006",
      availableCredit: 10,
    });
    await factory.create({
      name: "P2",
      email: "page.2@example.com",
      phoneNumber: "+34600110007",
      availableCredit: 20,
    });
    await factory.create({
      name: "P3",
      email: "page.3@example.com",
      phoneNumber: "+34600110008",
      availableCredit: 30,
    });

    const res = await request(app.getHttpServer())
      .get(
        "/api/customers?sortBy=availableCredit&sortOrder=asc&page=2&pageSize=2"
      )
      .expect(200);

    expect(res.body.total).toBe(3);
    expect(res.body.customers).toHaveLength(1);
    expect(res.body.customers[0].availableCredit).toBe(30);
  });

  it("GET /api/customers should default invalid page/pageSize (e.g. 0) to page=1/pageSize=10", async () => {
    await factory.create({
      name: "N1",
      email: "norm.1@example.com",
      phoneNumber: "+34600110009",
      availableCredit: 10,
    });
    await factory.create({
      name: "N2",
      email: "norm.2@example.com",
      phoneNumber: "+34600110010",
      availableCredit: 20,
    });

    const res = await request(app.getHttpServer())
      .get(
        "/api/customers?sortBy=availableCredit&sortOrder=asc&page=0&pageSize=0"
      )
      .expect(200);

    expect(res.body.total).toBe(2);
    expect(res.body.customers).toHaveLength(2);
    expect(res.body.customers.map((c: any) => c.availableCredit)).toEqual([
      10, 20,
    ]);
  });

  afterAll(async () => {
    await app.close();
  });
});
