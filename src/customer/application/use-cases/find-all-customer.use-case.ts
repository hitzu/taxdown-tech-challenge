import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import { FindAllCustomerInputDto, FindAllCustomerOutputDto } from "../dto";

export class FindAllCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryPort) {}

  async execute(
    query: FindAllCustomerInputDto
  ): Promise<FindAllCustomerOutputDto> {
    const { customers, total } = await this.customerRepository.findAll(query);
    return {
      customers: customers.map((customer) => {
        return {
          id: customer.id.getValue(),
          name: customer.name,
          email: customer.email.getValue(),
          phoneNumber: customer.phoneNumber.getValue(),
          availableCredit: customer.availableCredit.getValue(),
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
          deletedAt: customer.deletedAt,
        };
      }),
      total,
    };
  }
}
