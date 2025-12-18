import { CustomerId } from "./value-objects";

export type DomainErrorCode =
  | "CUSTOMER_NOT_FOUND"
  | "CUSTOMER_NAME_EMPTY"
  | "CUSTOMER_EMAIL_INVALID"
  | "CUSTOMER_PHONE_NUMBER_INVALID"
  | "CUSTOMER_AVAILABLE_CREDIT_NEGATIVE"
  | "CUSTOMER_ID_POSITIVE"
  | "CUSTOMER_ALREADY_EXISTS_EMAIL_PHONE_NUMBER"
  | "CUSTOMER_AVAILABLE_CREDIT_POSITIVE";

export class DomainError extends Error {
  constructor(public readonly code: DomainErrorCode, message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class CustomerNotFoundError extends DomainError {
  constructor(id: CustomerId) {
    super("CUSTOMER_NOT_FOUND", `Customer with id ${id.getValue()} not found`);
  }
}

export class CustomerNameEmptyError extends DomainError {
  constructor() {
    super("CUSTOMER_NAME_EMPTY", "Customer name cannot be empty");
  }
}

export class CustomerEmailInvalidError extends DomainError {
  constructor(email: string) {
    super("CUSTOMER_EMAIL_INVALID", `Invalid email address: ${email}`);
  }
}

export class CustomerPhoneNumberInvalidError extends DomainError {
  constructor(phoneNumber: string) {
    super(
      "CUSTOMER_PHONE_NUMBER_INVALID",
      `Invalid phone number: ${phoneNumber}`
    );
  }
}

export class CustomerAvailableCreditNegativeError extends DomainError {
  constructor(availableCredit: number) {
    super(
      "CUSTOMER_AVAILABLE_CREDIT_NEGATIVE",
      `Available credit cannot be negative: ${availableCredit}`
    );
  }
}

export class CustomerIdPositiveError extends DomainError {
  constructor(id: number) {
    super(
      "CUSTOMER_ID_POSITIVE",
      `Customer ID must be positive integer: ${id}`
    );
  }
}

export class CustomerAlreadyExistsEmailPhoneNumberError extends DomainError {
  constructor(email: string, phoneNumber: string) {
    super(
      "CUSTOMER_ALREADY_EXISTS_EMAIL_PHONE_NUMBER",
      `Customer with email ${email} and phone number ${phoneNumber} already exists`
    );
  }
}

export class CustomerAvailableCreditPositiveError extends DomainError {
  constructor(availableCredit: number) {
    super(
      "CUSTOMER_AVAILABLE_CREDIT_POSITIVE",
      `Available credit must be positive: ${availableCredit}`
    );
  }
}
