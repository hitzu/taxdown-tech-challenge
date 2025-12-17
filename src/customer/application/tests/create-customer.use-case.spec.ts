import { CreateCustomerUseCase } from "../use-cases/create-customer.use-case";
import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import { Customer } from "../../domain/entities/customer.entity";
import { CustomerId } from "../../domain/value-objects/customer-id.vo";

class InMemoryCustomerRepository implements CustomerRepositoryPort {
  private store: Customer[] = [];
  private currentId = 1;

  async findById(id: CustomerId): Promise<Customer | null> {
    return this.store.find((c) => c.id.getValue() === id.getValue()) ?? null;
  }

  async findAll(): Promise<Customer[]> {
    return [...this.store].sort(
      (a, b) => b.availableCredit.getValue() - a.availableCredit.getValue()
    );
  }

  async save(customer: Customer): Promise<Customer> {
    let entity = customer;

    // Si el id es null/any, simulamos asignación de id como lo haría la DB
    if (!entity.id || typeof entity.id.getValue !== "function") {
      const id = CustomerId.from(this.currentId++);
      entity = Customer.restore({
        id,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        availableCredit: customer.availableCredit,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      });
    }

    this.store.push(entity);
    return entity;
  }

  async delete(id: CustomerId): Promise<void> {
    this.store = this.store.filter((c) => c.id.getValue() !== id.getValue());
  }
}

describe("CreateCustomerUseCase", () => {
  it("should create a customer with valid data", async () => {
    const repo = new InMemoryCustomerRepository();
    const useCase = new CreateCustomerUseCase(repo);

    const output = await useCase.execute({
      name: "John Doe",
      email: "john@example.com",
      phoneNumber: "+34600123456",
      initialAvailableCredit: 100,
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
        initialAvailableCredit: 0,
      })
    ).rejects.toThrow();
  });
});
