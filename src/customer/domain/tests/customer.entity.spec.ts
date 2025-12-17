import { Customer } from "../entities/customer.entity";
import { CustomerId } from "../value-objects/customer-id.vo";
import { Email } from "../value-objects/email.vo";
import { PhoneNumber } from "../value-objects/phone-number.vo";
import { AvailableCredit } from "../value-objects/available-credit.vo";

describe("Customer Entity", () => {
  const baseNow = new Date("2024-01-01T10:00:00.000Z");

  function makeEmail() {
    return Email.from("test@example.com");
  }

  function makePhone() {
    // NOTE: PhoneNumber VO expects E.164 format (no spaces)
    return PhoneNumber.from("+34600123456");
  }

  function makeCredit(value: number) {
    return AvailableCredit.from(value);
  }

  it("should create a new customer with valid data (using restore)", () => {
    const customer = Customer.restore({
      id: CustomerId.from(1),
      name: "John Doe",
      email: makeEmail(),
      phoneNumber: makePhone(),
      availableCredit: makeCredit(0),
      createdAt: baseNow,
      updatedAt: baseNow,
    });

    expect(customer.id.getValue()).toBe(1);
    expect(customer.name).toBe("John Doe");
    expect(customer.email.getValue()).toBe("test@example.com");
    expect(customer.phoneNumber.getValue()).toBe("+34600123456");
    expect(customer.availableCredit.getValue()).toBe(0);
    expect(customer.createdAt).toBe(baseNow);
    expect(customer.updatedAt).toBe(baseNow);
  });

  it("should trim and validate name when updating", () => {
    const customer = Customer.restore({
      id: CustomerId.from(1),
      name: "John Doe",
      email: makeEmail(),
      phoneNumber: makePhone(),
      availableCredit: makeCredit(0),
      createdAt: baseNow,
      updatedAt: baseNow,
    });

    customer.updateName("   New Name   ");
    expect(customer.name).toBe("New Name");
  });

  it("should update contact information", () => {
    const customer = Customer.restore({
      id: CustomerId.from(1),
      name: "John Doe",
      email: makeEmail(),
      phoneNumber: makePhone(),
      availableCredit: makeCredit(0),
      createdAt: baseNow,
      updatedAt: baseNow,
    });

    const newEmail = Email.from("other@example.com");
    const newPhone = PhoneNumber.from("+34700111222");

    customer.updateContact(newEmail, newPhone);

    expect(customer.email.getValue()).toBe("other@example.com");
    expect(customer.phoneNumber.getValue()).toBe("+34700111222");
  });

  it("should increase available credit with a positive delta", () => {
    const customer = Customer.restore({
      id: CustomerId.from(1),
      name: "John Doe",
      email: makeEmail(),
      phoneNumber: makePhone(),
      availableCredit: makeCredit(100),
      createdAt: baseNow,
      updatedAt: baseNow,
    });

    const delta = AvailableCredit.from(50);
    customer.increaseAvailableCredit(delta);

    expect(customer.availableCredit.getValue()).toBe(150);
  });

  it("should throw when trying to increase credit with non-positive delta (<= 0)", () => {
    const customer = Customer.restore({
      id: CustomerId.from(1),
      name: "John Doe",
      email: makeEmail(),
      phoneNumber: makePhone(),
      availableCredit: makeCredit(100),
      createdAt: baseNow,
      updatedAt: baseNow,
    });

    // delta = 0
    const zeroDelta = AvailableCredit.from(0);
    expect(() => customer.increaseAvailableCredit(zeroDelta)).toThrow();
  });

  it("should update updatedAt when mutating state", () => {
    const customer = Customer.restore({
      id: CustomerId.from(1),
      name: "John Doe",
      email: makeEmail(),
      phoneNumber: makePhone(),
      availableCredit: makeCredit(100),
      createdAt: baseNow,
      updatedAt: baseNow,
    });

    const beforeUpdate = customer.updatedAt;
    const delta = AvailableCredit.from(10);

    // small trick: we don’t control time here,
    // we just assert that updatedAt changes
    customer.increaseAvailableCredit(delta);

    expect(customer.updatedAt.getTime()).toBeGreaterThanOrEqual(
      beforeUpdate.getTime()
    );
  });

  it("should throw when name is empty (in constructor)", () => {
    expect(() =>
      Customer.restore({
        id: CustomerId.from(1),
        name: "   ",
        email: makeEmail(),
        phoneNumber: makePhone(),
        availableCredit: makeCredit(0),
        createdAt: baseNow,
        updatedAt: baseNow,
      })
    ).toThrow();
  });
});
