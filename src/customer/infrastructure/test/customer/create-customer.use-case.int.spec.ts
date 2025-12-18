import { AppDataSource as TestDataSource } from "../../../../shared/persistence/data-source";
import { CustomerOrmEntity } from "../../persistence/customer.orm-entity";
import { CustomerFactory } from "../../../../../test/factories/customer.factory";

describe("CustomerRepositoryAdapter (integration)", () => {
  let factory: CustomerFactory;

  beforeAll(async () => {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    factory = new CustomerFactory(TestDataSource);
  });

  it("saves and retrieves a customer", async () => {
    const customer = await factory.create();

    const found = await TestDataSource.getRepository(CustomerOrmEntity).findOne(
      { where: { id: customer.id } }
    );

    expect(found).not.toBeNull();
    expect(found!.name).toBe(customer.name);
  });

  it("fails when customer with same email and phone already exists", async () => {
    const customer = await factory.create();

    await expect(
      factory.create({
        email: customer.email,
        phoneNumber: customer.phoneNumber,
      })
    ).rejects.toThrow();
  });
});
