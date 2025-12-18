import { DeleteCustomerUseCase } from "../use-cases/delete-customer.use-case";
import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import { Customer } from "../../domain/entities/customer.entity";
import {
  AvailableCredit,
  CustomerId,
  Email,
  PhoneNumber,
} from "../../domain/value-objects";
import {
  CustomerIdPositiveError,
  CustomerNotFoundError,
} from "../../domain/errors";

class InMemoryCustomerRepository implements CustomerRepositoryPort {
  private store: Customer[] = [];

  public findByIdCalls: CustomerId[] = [];
  public deleteCalls: CustomerId[] = [];

  public failFindByIdWith: Error | null = null;
  public failDeleteWith: Error | null = null;

  async save(customer: Customer): Promise<Customer> {
    this.store.push(customer);
    return customer;
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    this.findByIdCalls.push(id);
    if (this.failFindByIdWith) {
      throw this.failFindByIdWith;
    }
    return this.store.find((c) => c.id.getValue() === id.getValue()) ?? null;
  }

  async findAll(): Promise<{ customers: Customer[]; total: number }> {
    return { customers: [...this.store], total: this.store.length };
  }

  async delete(id: CustomerId): Promise<void> {
    this.deleteCalls.push(id);
    if (this.failDeleteWith) {
      throw this.failDeleteWith;
    }
    this.store = this.store.filter((c) => c.id.getValue() !== id.getValue());
  }

  async findByEmailAndPhoneNumber(): Promise<Customer | null> {
    return null;
  }
}

const buildCustomer = (id: number): Customer => {
  return Customer.restore({
    id: CustomerId.from(id),
    name: "Jane Doe",
    email: Email.from("jane@example.com"),
    phoneNumber: PhoneNumber.from("+34600123456"),
    availableCredit: AvailableCredit.from(10),
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
  });
};

describe("DeleteCustomerUseCase", () => {
  it("deletes a customer when the id exists", async () => {
    // Arrange
    const repo = new InMemoryCustomerRepository();
    await repo.save(buildCustomer(1));
    const useCase = new DeleteCustomerUseCase(repo);

    // Act
    await expect(useCase.execute(1)).resolves.toBeUndefined();

    // Assert
    expect(repo.findByIdCalls).toHaveLength(1);
    expect(repo.findByIdCalls[0].getValue()).toBe(1);

    expect(repo.deleteCalls).toHaveLength(1);
    expect(repo.deleteCalls[0].getValue()).toBe(1);

    await expect(repo.findById(CustomerId.from(1))).resolves.toBeNull();
  });

  it("throws CustomerNotFoundError when the customer does not exist", async () => {
    // Arrange
    const repo = new InMemoryCustomerRepository();
    const useCase = new DeleteCustomerUseCase(repo);

    // Act + Assert
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(
      CustomerNotFoundError
    );

    expect(repo.deleteCalls).toHaveLength(0);
  });

  it.each([0, -1, 1.5, Number.NaN])(
    "throws CustomerIdPositiveError when id is invalid (%p)",
    async (invalidId) => {
      // Arrange
      const repo = new InMemoryCustomerRepository();
      const useCase = new DeleteCustomerUseCase(repo);

      // Act + Assert
      await expect(useCase.execute(invalidId as number)).rejects.toBeInstanceOf(
        CustomerIdPositiveError
      );

      expect(repo.findByIdCalls).toHaveLength(0);
      expect(repo.deleteCalls).toHaveLength(0);
    }
  );

  it("propagates repository errors from findById", async () => {
    // Arrange
    const error = new Error("repo down");
    const repo = new InMemoryCustomerRepository();
    repo.failFindByIdWith = error;
    const useCase = new DeleteCustomerUseCase(repo);

    // Act + Assert
    await expect(useCase.execute(1)).rejects.toBe(error);

    expect(repo.deleteCalls).toHaveLength(0);
  });

  it("propagates repository errors from delete", async () => {
    // Arrange
    const error = new Error("delete failed");
    const repo = new InMemoryCustomerRepository();
    await repo.save(buildCustomer(1));
    repo.failDeleteWith = error;
    const useCase = new DeleteCustomerUseCase(repo);

    // Act + Assert
    await expect(useCase.execute(1)).rejects.toBe(error);
  });
});
