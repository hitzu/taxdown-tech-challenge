import { Customer } from "../entities/customer.entity";
import { CustomerId, Email, PhoneNumber } from "../value-objects";

export interface CustomerRepositoryPort {
  findById(id: CustomerId): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  save(customer: Customer): Promise<Customer>;
  delete(id: CustomerId): Promise<void>;
  findByEmailAndPhoneNumber(
    email: Email,
    phoneNumber: PhoneNumber
  ): Promise<Customer | null>;
}
