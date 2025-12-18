import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import { CustomerDto } from "../dto";
import { CustomerId } from "../../domain/value-objects";

export class FindCustomerByIdUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryPort) {}

  async execute(id: number): Promise<CustomerDto | null> {
    const customerFound = await this.customerRepository.findById(
      CustomerId.from(id)
    );

    if (!customerFound) {
      return null;
    }

    return {
      id: customerFound.id.getValue(),
      name: customerFound.name,
      email: customerFound.email.getValue(),
      phoneNumber: customerFound.phoneNumber.getValue(),
      availableCredit: customerFound.availableCredit.getValue(),
      createdAt: customerFound.createdAt,
      updatedAt: customerFound.updatedAt,
      deletedAt: customerFound.deletedAt,
    };
  }
}
