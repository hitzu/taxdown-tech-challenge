import { CustomerAvailableCreditNegativeError } from "../errors";

export class AvailableCredit {
  private constructor(private readonly value: number) {}

  static from(value: number): AvailableCredit {
    if (value < 0) {
      throw new CustomerAvailableCreditNegativeError(value);
    }

    return new AvailableCredit(value);
  }

  getValue(): number {
    return this.value;
  }

  add(delta: number): AvailableCredit {
    const newValue = this.value + delta;

    if (newValue < 0) {
      throw new CustomerAvailableCreditNegativeError(newValue);
    }

    return new AvailableCredit(newValue);
  }
}
