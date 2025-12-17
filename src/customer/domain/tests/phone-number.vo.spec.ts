import { PhoneNumber } from "../value-objects";
import { CustomerPhoneNumberInvalidError } from "../errors";

describe("PhoneNumber Value Object", () => {
  it("should create a PhoneNumber for a valid E.164 phone number", () => {
    const phone = PhoneNumber.from("+14155552671");
    expect(phone.getValue()).toBe("+14155552671");
  });

  it("should create a PhoneNumber for a valid E.164 phone number without plus", () => {
    const phone = PhoneNumber.from("14155552671");
    expect(phone.getValue()).toBe("14155552671");
  });

  it("should throw for an invalid phone number", () => {
    expect(() => PhoneNumber.from("0123")).toThrow(
      CustomerPhoneNumberInvalidError
    );
    expect(() => PhoneNumber.from("0123")).toThrow(
      "Invalid phone number: 0123"
    );
  });
});


