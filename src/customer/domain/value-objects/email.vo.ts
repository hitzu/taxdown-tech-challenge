import { CustomerEmailInvalidError } from "../errors";

export class Email {
  private constructor(private readonly value: string) {}

  static from(value: string): Email {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new CustomerEmailInvalidError(value);
    }

    return new Email(value);
  }

  getValue(): string {
    return this.value;
  }
}
