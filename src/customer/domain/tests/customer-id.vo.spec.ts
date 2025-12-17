import { CustomerId } from "../value-objects";
import { CustomerIdPositiveError } from "../errors";

describe("CustomerId Value Object", () => {
  it("should create a CustomerId for positive integers", () => {
    const id = CustomerId.from(1);
    expect(id.getValue()).toBe(1);
  });

  it("should throw for zero", () => {
    expect(() => CustomerId.from(0)).toThrow(CustomerIdPositiveError);
    expect(() => CustomerId.from(0)).toThrow(
      "Customer ID must be positive integer: 0"
    );
  });

  it("should throw for negative numbers", () => {
    expect(() => CustomerId.from(-1)).toThrow(CustomerIdPositiveError);
  });

  it("should throw for non-integers", () => {
    expect(() => CustomerId.from(1.5)).toThrow(CustomerIdPositiveError);
  });
});
