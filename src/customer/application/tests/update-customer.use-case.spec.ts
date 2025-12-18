import { UpdateCustomerUseCase } from "../use-cases/update-customer.use-case";
import { Customer } from "../../domain/entities/customer.entity";
import {
  AvailableCredit,
  CustomerId,
  Email,
  PhoneNumber,
} from "../../domain/value-objects";
import {
  CustomerAvailableCreditNegativeError,
  CustomerEmailInvalidError,
  CustomerIdPositiveError,
  CustomerNotFoundError,
  CustomerPhoneNumberInvalidError,
} from "../../domain/errors";
import { UpdateCustomerInputDto } from "../dto/update-customer.dto";
import { InMemoryCustomerRepository } from "../../../../test/utils/in-memory-customer-repository";

const buildUpdateInput = (
  overrides: Partial<UpdateCustomerInputDto> = {}
): UpdateCustomerInputDto => ({
  name: "John Updated",
  email: "john.updated@example.com",
  phoneNumber: "+34600999888",
  availableCredit: 250,
  ...overrides,
});

describe("UpdateCustomerUseCase", () => {
  it("should update a customer with valid data", async () => {
    // Arrange
    const repo = new InMemoryCustomerRepository();
    const useCase = new UpdateCustomerUseCase(repo);

    await repo.save(
      Customer.restore({
        id: CustomerId.from(1),
        name: "John Doe",
        email: Email.from("john@example.com"),
        phoneNumber: PhoneNumber.from("+34600123456"),
        availableCredit: AvailableCredit.from(100),
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
      })
    );

    const input = buildUpdateInput({
      name: "John Updated",
      email: "john.updated@example.com",
      phoneNumber: "+34600999888",
      availableCredit: 250,
    });

    // Act
    await useCase.execute(1, input);

    // Assert
    expect(repo.updateCalls).toHaveLength(1);
    expect(repo.updateCalls[0]!.id.getValue()).toBe(1);

    const updateArg = repo.updateCalls[0]!.customer;
    expect(updateArg.email).toBeInstanceOf(Email);
    expect((updateArg.email as Email).getValue()).toBe(
      "john.updated@example.com"
    );
    expect(updateArg.phoneNumber).toBeInstanceOf(PhoneNumber);
    expect((updateArg.phoneNumber as PhoneNumber).getValue()).toBe(
      "+34600999888"
    );
    expect(updateArg.availableCredit).toBeInstanceOf(AvailableCredit);
    expect((updateArg.availableCredit as AvailableCredit).getValue()).toBe(250);

    const updated = await repo.findById(CustomerId.from(1));
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe("John Updated");
    expect(updated!.email.getValue()).toBe("john.updated@example.com");
    expect(updated!.phoneNumber.getValue()).toBe("+34600999888");
    expect(updated!.availableCredit.getValue()).toBe(250);
  });

  it("should allow partial updates (e.g. only name + email)", async () => {
    // Arrange
    const repo = new InMemoryCustomerRepository();
    const useCase = new UpdateCustomerUseCase(repo);

    await repo.save(
      Customer.restore({
        id: CustomerId.from(1),
        name: "Update Me",
        email: Email.from("update.me@example.com"),
        phoneNumber: PhoneNumber.from("+34600119999"),
        availableCredit: AvailableCredit.from(123),
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
      })
    );

    // Act
    await useCase.execute(1, {
      name: "Updated Name",
      email: "updated@example.com",
    });

    // Assert
    expect(repo.updateCalls).toHaveLength(1);
    const updateArg = repo.updateCalls[0]!.customer;
    expect(updateArg).toMatchObject({
      name: "Updated Name",
    });
    expect(updateArg.email).toBeInstanceOf(Email);
    expect((updateArg.email as Email).getValue()).toBe("updated@example.com");
    expect("phoneNumber" in updateArg).toBe(false);
    expect("availableCredit" in updateArg).toBe(false);

    const updated = await repo.findById(CustomerId.from(1));
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe("Updated Name");
    expect(updated!.email.getValue()).toBe("updated@example.com");
    expect(updated!.phoneNumber.getValue()).toBe("+34600119999");
    expect(updated!.availableCredit.getValue()).toBe(123);
  });

  it("should throw CustomerNotFoundError when customer does not exist", async () => {
    // Arrange
    const repo = new InMemoryCustomerRepository();
    const useCase = new UpdateCustomerUseCase(repo);

    // Act + Assert
    await expect(
      useCase.execute(999, buildUpdateInput())
    ).rejects.toBeInstanceOf(CustomerNotFoundError);
    expect(repo.updateCalls).toHaveLength(0);
  });

  it("should throw CustomerIdPositiveError when id is not a positive integer", async () => {
    // Arrange
    const repo = new InMemoryCustomerRepository();
    const useCase = new UpdateCustomerUseCase(repo);

    // Act + Assert
    await expect(useCase.execute(0, buildUpdateInput())).rejects.toBeInstanceOf(
      CustomerIdPositiveError
    );
    expect(repo.findByIdCalls).toHaveLength(0);
    expect(repo.updateCalls).toHaveLength(0);
  });

  it.each([
    {
      case: "invalid email",
      overrides: { email: "not-an-email" },
      error: CustomerEmailInvalidError,
    },
    {
      case: "invalid phone number",
      overrides: { phoneNumber: "invalid" },
      error: CustomerPhoneNumberInvalidError,
    },
    {
      case: "negative available credit",
      overrides: { availableCredit: -1 },
      error: CustomerAvailableCreditNegativeError,
    },
  ] as const)(
    "should surface VO validation error when $case",
    async ({ overrides, error }) => {
      // Arrange
      const repo = new InMemoryCustomerRepository();
      const useCase = new UpdateCustomerUseCase(repo);

      await repo.save(
        Customer.restore({
          id: CustomerId.from(1),
          name: "John Doe",
          email: Email.from("john@example.com"),
          phoneNumber: PhoneNumber.from("+34600123456"),
          availableCredit: AvailableCredit.from(100),
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        })
      );

      // Act + Assert
      await expect(
        useCase.execute(1, buildUpdateInput(overrides))
      ).rejects.toBeInstanceOf(error);
      expect(repo.updateCalls).toHaveLength(0);
    }
  );

  it("should fail if updated name becomes empty after trim (domain invariant)", async () => {
    // Arrange
    const repo = new InMemoryCustomerRepository();
    const useCase = new UpdateCustomerUseCase(repo);

    await repo.save(
      Customer.restore({
        id: CustomerId.from(1),
        name: "John Doe",
        email: Email.from("john@example.com"),
        phoneNumber: PhoneNumber.from("+34600123456"),
        availableCredit: AvailableCredit.from(100),
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
      })
    );

    // Act + Assert
    await expect(
      useCase.execute(1, buildUpdateInput({ name: "   " }))
    ).rejects.toThrow("Customer name cannot be empty");
    expect(repo.updateCalls).toHaveLength(1);
  });
});
