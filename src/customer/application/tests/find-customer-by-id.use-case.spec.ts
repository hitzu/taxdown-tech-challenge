import { FindCustomerByIdUseCase } from "../use-cases/find-customer-by-id.use-case";
import { Customer } from "../../domain/entities/customer.entity";
import {
  AvailableCredit,
  CustomerId,
  Email,
  PhoneNumber,
} from "../../domain/value-objects";
import { InMemoryCustomerRepository } from "../../../../test/utils/in-memory-customer-repository";

describe("FindCustomerByIdUseCase", () => {
  it("returns customer dto when the id exists", async () => {
    const repo = new InMemoryCustomerRepository();
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    const updatedAt = new Date("2024-01-02T00:00:00.000Z");
    const customer = Customer.restore({
      id: CustomerId.from(1),
      name: "Jane Doe",
      email: Email.from("jane@example.com"),
      phoneNumber: PhoneNumber.from("+34600123456"),
      availableCredit: AvailableCredit.from(150),
      createdAt,
      updatedAt,
    });
    await repo.save(customer);
    const useCase = new FindCustomerByIdUseCase(repo);

    const result = await useCase.execute(1);

    expect(result).toEqual({
      id: 1,
      name: "Jane Doe",
      email: "jane@example.com",
      phoneNumber: "+34600123456",
      availableCredit: 150,
      createdAt,
      updatedAt,
      deletedAt: null,
    });
  });

  it("returns null when the customer does not exist", async () => {
    const repo = new InMemoryCustomerRepository();
    const useCase = new FindCustomerByIdUseCase(repo);

    const result = await useCase.execute(99);

    expect(result).toBeNull();
  });
});
