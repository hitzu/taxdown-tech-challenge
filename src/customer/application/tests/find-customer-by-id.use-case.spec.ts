import { FindCustomerByIdUseCase } from "../use-cases/find-customer-by-id.use-case";
import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import { Customer } from "../../domain/entities/customer.entity";
import {
  AvailableCredit,
  CustomerId,
  Email,
  PhoneNumber,
} from "../../domain/value-objects";

class InMemoryCustomerRepository implements CustomerRepositoryPort {
  private store: Customer[] = [];
  private currentId = 1;

  async findById(id: CustomerId): Promise<Customer | null> {
    return this.store.find((c) => c.id.getValue() === id.getValue()) ?? null;
  }

  async findAll(query: {
    sortBy: "availableCredit" | "name" | "createdAt";
    sortOrder: "asc" | "desc";
    page: number;
    pageSize: number;
  }): Promise<{ customers: Customer[]; total: number }> {
    const { sortBy, sortOrder, page, pageSize } = query;
    const sorted = [...this.store].sort((a, b) => {
      if (sortBy === "availableCredit") {
        return sortOrder === "asc"
          ? a.availableCredit.getValue() - b.availableCredit.getValue()
          : b.availableCredit.getValue() - a.availableCredit.getValue();
      }
      return 0;
    });
    return {
      customers: sorted.slice((page - 1) * pageSize, page * pageSize),
      total: sorted.length,
    };
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

  async findByEmailAndPhoneNumber(
    email: Email,
    phoneNumber: PhoneNumber
  ): Promise<Customer | null> {
    return (
      this.store.find(
        (c) =>
          c.email.getValue() === email.getValue() &&
          c.phoneNumber.getValue() === phoneNumber.getValue()
      ) ?? null
    );
  }
}

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
