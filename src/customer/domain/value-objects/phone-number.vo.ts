import { CustomerPhoneNumberInvalidError } from "../errors";

export class PhoneNumber {
  private constructor(private readonly value: string) {}

  static from(value: string): PhoneNumber {
    const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneNumberRegex.test(value)) {
      throw new CustomerPhoneNumberInvalidError(value);
    }

    return new PhoneNumber(value);
  }

  getValue(): string {
    return this.value;
  }
}
