import { CustomerNotFoundError } from "../../domain/errors";
import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import { CustomerId } from "../../domain/value-objects";

export class DeleteCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryPort) {}

  async execute(id: number): Promise<void> {
    const customerId = CustomerId.from(id);

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }

    await this.customerRepository.delete(customerId);
  }
}
