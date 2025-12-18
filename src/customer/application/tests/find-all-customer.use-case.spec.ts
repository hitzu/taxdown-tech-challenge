import { Customer } from "../../domain/entities/customer.entity";
import {
  AvailableCredit,
  CustomerId,
  Email,
  PhoneNumber,
} from "../../domain/value-objects";
import { FindAllCustomerUseCase } from "../use-cases/find-all-customer.use-case";
import { FindAllCustomerInputDto } from "../dto/find-all-customer.dto";
import { InMemoryCustomerRepository } from "../../../../test/utils/in-memory-customer-repository";

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
});
