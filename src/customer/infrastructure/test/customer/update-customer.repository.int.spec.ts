import { AppDataSource as TestDataSource } from "../../../../shared/persistence/data-source";
import { CustomerRepositoryAdapter } from "../../persistence/customer.repository.adapter";
import { CustomerOrmEntity } from "../../persistence/customer.orm-entity";
import { CustomerFactory } from "../../../../../test/factories/customer.factory";
import {
  CustomerId,
  Email,
  PhoneNumber,
  AvailableCredit,
} from "../../../domain/value-objects";
import { CustomerNotFoundError } from "../../../domain/errors";

describe("CustomerRepositoryAdapter.update (integration)", () => {
  let repo: CustomerRepositoryAdapter;
  let factory: CustomerFactory;

  beforeAll(async () => {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    const ormRepo = TestDataSource.getRepository(CustomerOrmEntity);
    repo = new CustomerRepositoryAdapter(ormRepo);
    factory = new CustomerFactory(TestDataSource);
  });

  it("updates a customer and returns the updated domain entity", async () => {
    const created = await factory.create({
      name: "Old Name",
      email: "old@example.com",
      phoneNumber: "+15550001111",
      availableCredit: 10,
    });

    const updated = await repo.update(CustomerId.from(created.id), {
      name: "New Name",
      email: Email.from("new@example.com"),
      phoneNumber: PhoneNumber.from("+15550002222"),
      availableCredit: AvailableCredit.from(99),
    });

    expect(updated.id.getValue()).toBe(created.id);
    expect(updated.name).toBe("New Name");
    expect(updated.email.getValue()).toBe("new@example.com");
    expect(updated.phoneNumber.getValue()).toBe("+15550002222");
    expect(updated.availableCredit.getValue()).toBe(99);

    const persisted = await TestDataSource.getRepository(
      CustomerOrmEntity
    ).findOne({
      where: { id: created.id },
    });
    expect(persisted).not.toBeNull();
    expect(persisted!.name).toBe("New Name");
    expect(persisted!.email).toBe("new@example.com");
    expect(persisted!.phoneNumber).toBe("+15550002222");
    expect(Number(persisted!.availableCredit)).toBe(99);
  });

  it("throws CustomerNotFoundError when the customer does not exist", async () => {
    await expect(
      repo.update(CustomerId.from(999999), { name: "Does not matter" })
    ).rejects.toBeInstanceOf(CustomerNotFoundError);
  });
});
