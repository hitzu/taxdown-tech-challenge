import { Customer } from "../../domain/entities/customer.entity";
import {
  AvailableCredit,
  Email,
  PhoneNumber,
} from "../../domain/value-objects";
import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import { CreateCustomerInputDto, CreateCustomerOutputDto } from "../dto";
import { CustomerAlreadyExistsEmailPhoneNumberError } from "../../domain/errors";

export class CreateCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryPort) {}

  async execute(
    input: CreateCustomerInputDto
  ): Promise<CreateCustomerOutputDto> {
    const email = Email.from(input.email);
    const phoneNumber = PhoneNumber.from(input.phoneNumber);
    const availableCredit = AvailableCredit.from(input.availableCredit ?? 0);

    const existing = await this.customerRepository.findByEmailAndPhoneNumber(
      email,
      phoneNumber
    );
    if (existing) {
      throw new CustomerAlreadyExistsEmailPhoneNumberError(
        email.getValue(),
        phoneNumber.getValue()
      );
    }

    const customer = Customer.createNew({
      name: input.name,
      email,
      phoneNumber,
      initialCredit: availableCredit,
    });

    const persistedCustomer = await this.customerRepository.save(customer);

    return {
      id: persistedCustomer.id.getValue(),
      name: persistedCustomer.name,
      email: persistedCustomer.email.getValue(),
      phoneNumber: persistedCustomer.phoneNumber.getValue(),
      availableCredit: persistedCustomer.availableCredit.getValue(),
      createdAt: persistedCustomer.createdAt,
      updatedAt: persistedCustomer.updatedAt,
      deletedAt: persistedCustomer.deletedAt,
    };
  }
}
