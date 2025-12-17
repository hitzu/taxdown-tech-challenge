import {
  AvailableCredit,
  CustomerId,
  Email,
  PhoneNumber,
} from "../value-objects";

export class Customer {
  private constructor(
    public readonly id: CustomerId,
    private _name: string,
    private _email: Email,
    private _phoneNumber: PhoneNumber,
    private _availableCredit: AvailableCredit,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt?: Date
  ) {
    this.ensureValidName(_name);
  }

  static createNew(params: {
    name: string;
    email: Email;
    phoneNumber: PhoneNumber;
    initialCredit: AvailableCredit;
  }): Customer {
    const credit = params.initialCredit ?? AvailableCredit.from(0);

    return new Customer(
      null as any,
      params.name,
      params.email,
      params.phoneNumber,
      credit,
      new Date(),
      new Date()
    );
  }

  private ensureValidName(name: string): void {
    if (name.trim() === "") {
      throw new Error("Name cannot be empty");
    }
  }

  updateName(name: string): void {
    this.ensureValidName(name);
    this._name = name.trim();
    this.updated();
  }

  updateContact(email: Email, phoneNumber: PhoneNumber): void {
    this._email = email;
    this._phoneNumber = phoneNumber;
    this.updated();
  }

  increaseAvailableCredit(delta: AvailableCredit): void {
    if (delta.getValue() <= 0) {
      throw new Error(
        `IncreaseAvailableCredit delta must be positive. Received: ${delta.getValue()}`
      );
    }

    this._availableCredit = this._availableCredit.add(delta.getValue());
    this.updated();
  }

  static restore(params: {
    id: CustomerId;
    name: string;
    email: Email;
    phoneNumber: PhoneNumber;
    availableCredit: AvailableCredit;
    createdAt: Date;
    updatedAt: Date;
  }): Customer {
    return new Customer(
      params.id,
      params.name,
      params.email,
      params.phoneNumber,
      params.availableCredit,
      params.createdAt,
      params.updatedAt
    );
  }

  private updated(): void {
    this._updatedAt = new Date();
  }

  public deleted(): void {
    this._deletedAt = new Date();
  }

  get name(): string {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get phoneNumber(): PhoneNumber {
    return this._phoneNumber;
  }

  get availableCredit(): AvailableCredit {
    return this._availableCredit;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt ?? null;
  }
}
