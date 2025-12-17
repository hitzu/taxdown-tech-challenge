import { AvailableCredit } from "../value-objects";
import { CustomerAvailableCreditNegativeError } from "../errors";

describe("AvailableCredit Value Object", () => {
  it("should create an AvailableCredit for zero or positive values", () => {
    expect(AvailableCredit.from(0).getValue()).toBe(0);
    expect(AvailableCredit.from(10).getValue()).toBe(10);
  });

  it("should throw if created with a negative value", () => {
    expect(() => AvailableCredit.from(-1)).toThrow(
      CustomerAvailableCreditNegativeError
    );
    expect(() => AvailableCredit.from(-1)).toThrow(
      "Available credit cannot be negative: -1"
    );
  });

  it("should add deltas and return a new instance", () => {
    const credit = AvailableCredit.from(10);
    const updated = credit.add(5);

    expect(credit.getValue()).toBe(10);
    expect(updated.getValue()).toBe(15);
    expect(updated).not.toBe(credit);
  });

  it("should allow subtracting as long as it doesn't go below zero", () => {
    const credit = AvailableCredit.from(10);
    expect(credit.add(-3).getValue()).toBe(7);
  });

  it("should throw if add would make it negative", () => {
    const credit = AvailableCredit.from(10);
    expect(() => credit.add(-11)).toThrow(CustomerAvailableCreditNegativeError);
    expect(() => credit.add(-11)).toThrow(
      "Available credit cannot be negative: -1"
    );
  });
});


