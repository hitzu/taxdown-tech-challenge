import { Customer } from "../entities/customer.entity";
import { CustomerId, Email, PhoneNumber } from "../value-objects";

export interface CustomerRepositoryPort {
  save(customer: Customer): Promise<Customer>;
  findById(id: CustomerId): Promise<Customer | null>;
  findAll(query: {
    sortBy: "availableCredit" | "name" | "createdAt";
    sortOrder: "asc" | "desc";
    page: number;
    pageSize: number;
  }): Promise<{ customers: Customer[]; total: number }>;
  delete(id: CustomerId): Promise<void>;
  findByEmailAndPhoneNumber(
    email: Email,
    phoneNumber: PhoneNumber
  ): Promise<Customer | null>;
  update(id: CustomerId, customer: Partial<Customer>): Promise<Customer>;
}
