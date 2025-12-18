import { CustomerRepositoryPort } from "../../src/customer/domain/ports/customer-repository.port";
import { Customer } from "../../src/customer/domain/entities/customer.entity";
import {
  CustomerId,
  Email,
  PhoneNumber,
  AvailableCredit,
} from "../../src/customer/domain/value-objects";
import { CustomerNotFoundError } from "../../src/customer/domain/errors";
import { FindAllCustomerInputDto } from "../../src/customer/application/dto/find-all-customer.dto";

export class InMemoryCustomerRepository implements CustomerRepositoryPort {
  private store: Customer[] = [];
  private currentId = 1;
  public findByIdCalls: CustomerId[] = [];
  public deleteCalls: CustomerId[] = [];
  public findAllCalls: FindAllCustomerInputDto[] = [];
  public lastFindAllQuery: FindAllCustomerInputDto | null = null;
  public updateCalls: Array<{ id: CustomerId; customer: Partial<Customer> }> =
    [];
  public failFindByIdWith: Error | null = null;
  public failDeleteWith: Error | null = null;
  public failFindAllWith: Error | null = null;
  public failUpdateWith: Error | null = null;

  async findById(id: CustomerId): Promise<Customer | null> {
    this.findByIdCalls.push(id);
    if (this.failFindByIdWith) {
      throw this.failFindByIdWith;
    }
    return this.store.find((c) => c.id.getValue() === id.getValue()) ?? null;
  }

  async findAll(query: {
    sortBy: "availableCredit" | "name" | "createdAt";
    sortOrder: "asc" | "desc";
    page: number;
    pageSize: number;
  }): Promise<{ customers: Customer[]; total: number }> {
    this.lastFindAllQuery = query as FindAllCustomerInputDto;
    this.findAllCalls.push(this.lastFindAllQuery);
    if (this.failFindAllWith) {
      throw this.failFindAllWith;
    }
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
    this.deleteCalls.push(id);
    if (this.failDeleteWith) {
      throw this.failDeleteWith;
    }
    this.store = this.store.filter((c) => c.id.getValue() !== id.getValue());
  }

  async update(id: CustomerId, customer: Partial<Customer>): Promise<Customer> {
    this.updateCalls.push({ id, customer });
    if (this.failUpdateWith) {
      throw this.failUpdateWith;
    }

    const existing = await this.findById(id);
    if (!existing) throw new CustomerNotFoundError(id);

    const updated = Customer.restore({
      id: existing.id,
      name: existing.name,
      email: existing.email,
      phoneNumber: existing.phoneNumber,
      availableCredit: existing.availableCredit,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
      ...customer,
    });

    this.store = this.store.map((c) =>
      c.id.getValue() === id.getValue() ? updated : c
    );
    return updated;
  }

  async addAvailableCredit(id: CustomerId, amount: number): Promise<Customer> {
    const existing = await this.findById(id);
    if (!existing) throw new CustomerNotFoundError(id);

    const updated = Customer.restore({
      id: existing.id,
      name: existing.name,
      email: existing.email,
      phoneNumber: existing.phoneNumber,
      availableCredit: existing.availableCredit.add(amount),
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
    });

    this.store = this.store.map((c) =>
      c.id.getValue() === id.getValue() ? updated : c
    );
    return updated;
  }
}

export const buildCustomer = (id: number): Customer => {
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

export const buildQuery = (
  overrides: Partial<FindAllCustomerInputDto> = {}
): FindAllCustomerInputDto => ({
  sortBy: "availableCredit",
  sortOrder: "asc",
  page: 1,
  pageSize: 10,
  ...overrides,
});
