import { CustomerNotFoundError } from "../../domain/errors";
import { Customer } from "../../domain/entities/customer.entity";
import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import {
  AvailableCredit,
  CustomerId,
  Email,
  PhoneNumber,
} from "../../domain/value-objects";
import { UpdateCustomerInputDto } from "../dto/update-customer.dto";

export class UpdateCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryPort) {}

  async execute(id: number, customer: UpdateCustomerInputDto): Promise<void> {
    const customerId = CustomerId.from(id);

    const customerFound = await this.customerRepository.findById(customerId);
    if (!customerFound) {
      throw new CustomerNotFoundError(customerId);
    }

    const patch: {
      name?: string;
      email?: Email;
      phoneNumber?: PhoneNumber;
      availableCredit?: AvailableCredit;
    } = {};

    if (customer.name !== undefined) {
      patch.name = customer.name;
    }
    if (customer.email !== undefined) {
      patch.email = Email.from(customer.email);
    }
    if (customer.phoneNumber !== undefined) {
      patch.phoneNumber = PhoneNumber.from(customer.phoneNumber);
    }
    if (customer.availableCredit !== undefined) {
      patch.availableCredit = AvailableCredit.from(customer.availableCredit);
    }

    await this.customerRepository.update(customerId, patch as Partial<Customer>);
  }
}
