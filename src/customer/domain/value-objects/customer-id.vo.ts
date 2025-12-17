import { CustomerIdPositiveError } from "../errors";

export class CustomerId {
  private constructor(private readonly value: number) {}

  static from(value: number): CustomerId {
    if (!Number.isInteger(value) || value <= 0) {
      throw new CustomerIdPositiveError(value);
    }

    return new CustomerId(value);
  }

  getValue(): number {
    return this.value;
  }
}
