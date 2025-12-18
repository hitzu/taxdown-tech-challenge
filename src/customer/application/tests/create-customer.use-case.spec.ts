import { CreateCustomerUseCase } from "../use-cases/create-customer.use-case";

import { CustomerAlreadyExistsEmailPhoneNumberError } from "../../domain/errors";
import { InMemoryCustomerRepository } from "../../../../test/utils/in-memory-customer-repository";

describe("CreateCustomerUseCase", () => {
  it("should create a customer with valid data", async () => {
    const repo = new InMemoryCustomerRepository();
    const useCase = new CreateCustomerUseCase(repo);

    const output = await useCase.execute({
      name: "John Doe",
      email: "john@example.com",
      phoneNumber: "+34600123456",
      availableCredit: 100,
    });

    expect(output.id).toBeGreaterThan(0);
    expect(output.name).toBe("John Doe");
    expect(output.email).toBe("john@example.com");
    expect(output.phoneNumber).toBe("+34600123456");
    expect(output.availableCredit).toBe(100);
    expect(output.createdAt).toBeInstanceOf(Date);
    expect(output.updatedAt).toBeInstanceOf(Date);
  });

  it("should fail when email is invalid", async () => {
    const repo = new InMemoryCustomerRepository();
    const useCase = new CreateCustomerUseCase(repo);

    await expect(
      useCase.execute({
        name: "John Doe",
        email: "not-an-email",
        phoneNumber: "+34600123456",
        availableCredit: 0,
      })
    ).rejects.toThrow();
  });

  it("should fail when customer with same email and phone already exists", async () => {
    const repo = new InMemoryCustomerRepository();
    const useCase = new CreateCustomerUseCase(repo);

    await useCase.execute({
      name: "Jane Doe",
      email: "jane@example.com",
      phoneNumber: "+34600111111",
      availableCredit: 25,
    });

    await expect(
      useCase.execute({
        name: "Duplicate Jane",
        email: "jane@example.com",
        phoneNumber: "+34600111111",
        availableCredit: 10,
      })
    ).rejects.toBeInstanceOf(CustomerAlreadyExistsEmailPhoneNumberError);
  });
});
