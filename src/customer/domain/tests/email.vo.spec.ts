import { Email } from "../value-objects";
import { CustomerEmailInvalidError } from "../errors";

describe("Email Value Object", () => {
  it("should create an Email for a valid email address", () => {
    const email = Email.from("john.doe@example.com");
    expect(email.getValue()).toBe("john.doe@example.com");
  });

  it("should throw for an invalid email address", () => {
    expect(() => Email.from("not-an-email")).toThrow(CustomerEmailInvalidError);
    expect(() => Email.from("not-an-email")).toThrow(
      "Invalid email address: not-an-email"
    );
  });
});


