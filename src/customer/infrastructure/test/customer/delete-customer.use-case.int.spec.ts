import { AppDataSource as TestDataSource } from "../../../../shared/persistence/data-source";
import { CustomerRepositoryAdapter } from "../../persistence/customer.repository.adapter";
import { CustomerOrmEntity } from "../../persistence/customer.orm-entity";
import { DeleteCustomerUseCase } from "../../../application/use-cases/delete-customer.use-case";
import { FindCustomerByIdUseCase } from "../../../application/use-cases/find-customer-by-id.use-case";
import { CustomerFactory } from "../../../../../test/factories/customer.factory";

describe("FindCustomerByIdUseCase (integration)", () => {
  let repo: CustomerRepositoryAdapter;
  let useCase: DeleteCustomerUseCase;
  let findCustomerByIdUseCase: FindCustomerByIdUseCase;
  let customerFactory: CustomerFactory;

  beforeAll(async () => {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    const ormRepo = TestDataSource.getRepository(CustomerOrmEntity);
    repo = new CustomerRepositoryAdapter(ormRepo);
    useCase = new DeleteCustomerUseCase(repo);
    findCustomerByIdUseCase = new FindCustomerByIdUseCase(repo);
    customerFactory = new CustomerFactory(TestDataSource);
  });

  it("deletes a customer when the id exists", async () => {
    const customer = await customerFactory.create();

    await useCase.execute(customer.id);

    const found = await findCustomerByIdUseCase.execute(customer.id);
    expect(found).toBeNull();
  });

  it("throws an error when the customer does not exist", async () => {
    await expect(useCase.execute(9999)).rejects.toThrow();
  });
});
