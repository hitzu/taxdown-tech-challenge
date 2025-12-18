import { AppDataSource as TestDataSource } from "../../../../shared/persistence/data-source";
import { CustomerRepositoryAdapter } from "../../persistence/customer.repository.adapter";
import { CustomerOrmEntity } from "../../persistence/customer.orm-entity";
import { FindCustomerByIdUseCase } from "../../../application/use-cases/find-customer-by-id.use-case";
import { CustomerFactory } from "../../../../../test/factories/customer.factory";

describe("FindCustomerByIdUseCase (integration)", () => {
  let repo: CustomerRepositoryAdapter;
  let useCase: FindCustomerByIdUseCase;
  let customerFactory: CustomerFactory;

  beforeAll(async () => {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    const ormRepo = TestDataSource.getRepository(CustomerOrmEntity);
    repo = new CustomerRepositoryAdapter(ormRepo);
    useCase = new FindCustomerByIdUseCase(repo);
    customerFactory = new CustomerFactory(TestDataSource);
  });

  it("returns a customer dto when the customer exists", async () => {
    const customer = await customerFactory.create({
      name: "John Doe",
      availableCredit: 100,
    });

    const result = await useCase.execute(customer.id);

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result).toMatchObject({
      id: customer.id,
      name: "John Doe",
      availableCredit: 100,
    });
  });

  it("returns null when the customer does not exist", async () => {
    const result = await useCase.execute(9999);

    expect(result).toBeNull();
  });
});
