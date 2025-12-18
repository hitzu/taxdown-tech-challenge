import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import { Customer } from "../../domain/entities/customer.entity";
import {
  AvailableCredit,
  CustomerId,
  Email,
  PhoneNumber,
} from "../../domain/value-objects";
import { FindAllCustomerUseCase } from "../use-cases/find-all-customer.use-case";
import { FindAllCustomerInputDto } from "../dto/find-all-customer.dto";
import { CustomerNotFoundError } from "../../domain/errors";

class InMemoryCustomerRepository implements CustomerRepositoryPort {
  private store: Customer[] = [];
  private currentId = 1;
  public lastFindAllQuery: FindAllCustomerInputDto | null = null;

  async findById(id: CustomerId): Promise<Customer | null> {
    return this.store.find((c) => c.id.getValue() === id.getValue()) ?? null;
  }

  async findAll(query: {
    sortBy: "availableCredit" | "name" | "createdAt";
    sortOrder: "asc" | "desc";
    page: number;
    pageSize: number;
  }): Promise<{ customers: Customer[]; total: number }> {
    this.lastFindAllQuery = query;
    const { sortBy, sortOrder, page, pageSize } = query;
    const sorted = [...this.store].sort((a, b) => {
      if (sortBy === "availableCredit") {
        return sortOrder === "asc"
          ? a.availableCredit.getValue() - b.availableCredit.getValue()
          : b.availableCredit.getValue() - a.availableCredit.getValue();
      }
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortBy === "createdAt") {
        return sortOrder === "asc"
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime();
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

  async update(id: CustomerId, customer: Partial<Customer>): Promise<Customer> {
    const customerFound = await this.findById(id);
    if (!customerFound) {
      throw new CustomerNotFoundError(id);
    }
    return this.update(id, customer);
  }
}

const buildQuery = (
  overrides: Partial<FindAllCustomerInputDto> = {}
): FindAllCustomerInputDto => ({
  sortBy: "availableCredit",
  sortOrder: "asc",
  page: 1,
  pageSize: 10,
  ...overrides,
});

describe("FindAllCustomerUseCase", () => {
  it("returns customers mapped to output dto and total, preserving repository order", async () => {
    // Arrange
    const repo = new InMemoryCustomerRepository();
    const useCase = new FindAllCustomerUseCase(repo);

    const c1 = Customer.restore({
      id: CustomerId.from(1),
      name: "Alice",
      email: Email.from("alice@example.com"),
      phoneNumber: PhoneNumber.from("+34600111111"),
      availableCredit: AvailableCredit.from(10),
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    });
    const c2 = Customer.restore({
      id: CustomerId.from(2),
      name: "Bob",
      email: Email.from("bob@example.com"),
      phoneNumber: PhoneNumber.from("+34600222222"),
      availableCredit: AvailableCredit.from(20),
      createdAt: new Date("2024-01-02T00:00:00.000Z"),
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    });

    await repo.save(c1);
    await repo.save(c2);

    const query = buildQuery({
      sortBy: "availableCredit",
      sortOrder: "desc",
      page: 1,
      pageSize: 10,
    });

    // Act
    const result = await useCase.execute(query);

    // Assert
    expect(repo.lastFindAllQuery).toEqual(query);
    expect(result.total).toBe(2);
    expect(result.customers).toHaveLength(2);

    expect(result.customers[0]).toMatchObject({
      id: 2,
      name: "Bob",
      email: "bob@example.com",
      phoneNumber: "+34600222222",
      availableCredit: 20,
      deletedAt: null,
    });
    expect(result.customers[0].createdAt).toBeInstanceOf(Date);
    expect(result.customers[0].updatedAt).toBeInstanceOf(Date);

    expect(result.customers[1]).toMatchObject({
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      phoneNumber: "+34600111111",
      availableCredit: 10,
      deletedAt: null,
    });
  });

  it("propagates repository errors", async () => {
    // Arrange
    const error = new Error("db down");
    const repo: CustomerRepositoryPort = {
      findById: async () => null,
      save: async (c) => c,
      delete: async () => undefined,
      findByEmailAndPhoneNumber: async () => null,
      findAll: async () => {
        throw error;
      },
      update: async () =>
        Customer.restore({
          id: CustomerId.from(1),
          name: "Alice",
          email: Email.from("alice@example.com"),
          phoneNumber: PhoneNumber.from("+34600111111"),
          availableCredit: AvailableCredit.from(10),
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
          updatedAt: new Date("2024-01-01T00:00:00.000Z"),
        }),
    };
    const useCase = new FindAllCustomerUseCase(repo);

    // Act + Assert
    await expect(useCase.execute(buildQuery())).rejects.toBe(error);
  });
});
