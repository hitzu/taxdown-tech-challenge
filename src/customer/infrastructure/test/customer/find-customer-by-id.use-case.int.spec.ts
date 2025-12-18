import { AppDataSource as TestDataSource } from "../../../../shared/persistence/data-source";
import { CustomerRepositoryAdapter } from "../../persistence/customer.repository.adapter";
import { CustomerOrmEntity } from "../../persistence/customer.orm-entity";
import { Customer } from "../../../domain/entities/customer.entity";
import { Email } from "../../../domain/value-objects/email.vo";
import { PhoneNumber } from "../../../domain/value-objects/phone-number.vo";
import { AvailableCredit } from "../../../domain/value-objects/available-credit.vo";
import { FindCustomerByIdUseCase } from "../../../application/use-cases/find-customer-by-id.use-case";

describe("FindCustomerByIdUseCase (integration)", () => {
  let repo: CustomerRepositoryAdapter;
  let useCase: FindCustomerByIdUseCase;

  beforeAll(async () => {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    const ormRepo = TestDataSource.getRepository(CustomerOrmEntity);
    repo = new CustomerRepositoryAdapter(ormRepo);
    useCase = new FindCustomerByIdUseCase(repo);
  });

  it("returns a customer dto when the customer exists", async () => {
    const customer = Customer.createNew({
      name: "John Doe",
      email: Email.from("john@example.com"),
      phoneNumber: PhoneNumber.from("+34600123456"),
      initialCredit: AvailableCredit.from(100),
    });

    const saved = await repo.save(customer);

    const result = await useCase.execute(saved.id.getValue());

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result).toMatchObject({
      id: saved.id.getValue(),
      name: "John Doe",
      email: "john@example.com",
      phoneNumber: "+34600123456",
      availableCredit: 100,
      deletedAt: null,
    });
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("returns null when the customer does not exist", async () => {
    const result = await useCase.execute(9999);

    expect(result).toBeNull();
  });

  it("enforces unique email and phone number combination", async () => {
    const first = Customer.createNew({
      name: "Jane Roe",
      email: Email.from("jane.dup@example.com"),
      phoneNumber: PhoneNumber.from("+34999111222"),
      initialCredit: AvailableCredit.from(50),
    });

    const duplicate = Customer.createNew({
      name: "Janet Roe",
      email: Email.from("jane.dup@example.com"),
      phoneNumber: PhoneNumber.from("+34999111222"),
      initialCredit: AvailableCredit.from(75),
    });

    await repo.save(first);

    await expect(repo.save(duplicate)).rejects.toMatchObject({
      message: expect.stringContaining("idx_unique_email_phone_number"),
    });
  });
});
