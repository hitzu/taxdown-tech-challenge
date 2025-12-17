import { AppDataSource as TestDataSource } from "../../../../shared/persistence/data-source";
import { CustomerRepositoryAdapter } from "../../persistence/customer.repository.adapter";
import { CustomerOrmEntity } from "../../persistence/customer.orm-entity";
import { Customer } from "../../../domain/entities/customer.entity";
import { Email } from "../../../domain/value-objects/email.vo";
import { PhoneNumber } from "../../../domain/value-objects/phone-number.vo";
import { AvailableCredit } from "../../../domain/value-objects/available-credit.vo";
import { CustomerId } from "../../../domain/value-objects/customer-id.vo";

describe("CustomerRepositoryAdapter (integration)", () => {
  let repo: CustomerRepositoryAdapter;

  beforeAll(async () => {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    const ormRepo = TestDataSource.getRepository(CustomerOrmEntity);
    repo = new CustomerRepositoryAdapter(ormRepo);
  });

  it("saves and retrieves a customer", async () => {
    const customer = Customer.createNew({
      name: "John Doe",
      email: Email.from("john@example.com"),
      phoneNumber: PhoneNumber.from("+34600123456"),
      initialCredit: AvailableCredit.from(100),
    });

    const saved = await repo.save(customer);

    const found = await repo.findById(CustomerId.from(saved.id.getValue()));

    expect(found).not.toBeNull();
    expect(found!.name).toBe("John Doe");
    expect(found!.availableCredit.getValue()).toBe(100);
  });
});
