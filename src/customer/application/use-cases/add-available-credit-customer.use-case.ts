import { CustomerNotFoundError } from "../../domain/errors";
import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import { AvailableCredit, CustomerId } from "../../domain/value-objects";
import { AddAvailableCreditCustomerInputDto } from "../dto/add-available-credit-customer.dto";

export class AddAvailableCreditCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryPort) {}

  async execute(input: AddAvailableCreditCustomerInputDto): Promise<void> {
    const customerId = CustomerId.from(input.id);

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }

    const delta = AvailableCredit.from(input.amount);
    customer.increaseAvailableCredit(delta);

    await this.customerRepository.save(customer);
  }
}
