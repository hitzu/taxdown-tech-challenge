export type DomainErrorCode = "CUSTOMER_NOT_FOUND";

export class DomainError extends Error {
  constructor(public readonly code: DomainErrorCode, message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class CustomerNotFoundError extends DomainError {
  constructor(id: number) {
    super("CUSTOMER_NOT_FOUND", `Customer with id ${id} not found`);
  }
}
