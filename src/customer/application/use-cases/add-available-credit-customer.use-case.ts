import { CustomerNotFoundError } from "../../domain/errors";
import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import { CustomerId } from "../../domain/value-objects";
import { AddAvailableCreditCustomerInputDto } from "../dto/add-available-credit-customer.dto";

export class AddAvailableCreditCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryPort) {}

  async execute(input: AddAvailableCreditCustomerInputDto): Promise<void> {
    const customerId = CustomerId.from(input.id);

    const customerFound = await this.customerRepository.findById(customerId);
    if (!customerFound) {
      throw new CustomerNotFoundError(customerId);
    }

    await this.customerRepository.addAvailableCredit(customerId, input.amount);
  }
}
