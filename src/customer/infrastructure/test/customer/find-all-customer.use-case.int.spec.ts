import { AppDataSource as TestDataSource } from "../../../../shared/persistence/data-source";
import { CustomerRepositoryAdapter } from "../../persistence/customer.repository.adapter";
import { CustomerOrmEntity } from "../../persistence/customer.orm-entity";
import { FindAllCustomerUseCase } from "../../../application/use-cases/find-all-customer.use-case";
import { CustomerFactory } from "../../../../../test/factories/customer.factory";

describe("FindAllCustomerUseCase (integration)", () => {
  let repo: CustomerRepositoryAdapter;
  let useCase: FindAllCustomerUseCase;
  let customerFactory: CustomerFactory;

  beforeAll(async () => {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    const ormRepo = TestDataSource.getRepository(CustomerOrmEntity);
    repo = new CustomerRepositoryAdapter(ormRepo);
    useCase = new FindAllCustomerUseCase(repo);
    customerFactory = new CustomerFactory(TestDataSource);
  });

  it("returns customers sorted by availableCredit asc", async () => {
    // Arrange
    await customerFactory.create({
      availableCredit: 100,
    });
    await customerFactory.create({
      availableCredit: 50,
    });
    await customerFactory.create({
      availableCredit: 200,
    });

    // Act
    const result = await useCase.execute({
      sortBy: "availableCredit",
      sortOrder: "asc",
      page: 1,
      pageSize: 10,
    });

    // Assert
    expect(result.total).toBe(3);
    expect(result.customers.map((c) => c.availableCredit)).toEqual([
      50, 100, 200,
    ]);
    expect(result.customers[0]).toMatchObject({
      deletedAt: null,
    });
    expect(result.customers[0].createdAt).toBeInstanceOf(Date);
    expect(result.customers[0].updatedAt).toBeInstanceOf(Date);
  });

  it("returns customers sorted by name desc", async () => {
    // Arrange
    await customerFactory.create({
      name: "Zoe",
    });
    await customerFactory.create({
      name: "Ana",
    });

    // Act
    const result = await useCase.execute({
      sortBy: "name",
      sortOrder: "desc",
      page: 1,
      pageSize: 10,
    });

    // Assert
    expect(result.total).toBe(2);
    expect(result.customers.map((c) => c.name)).toEqual(["Zoe", "Ana"]);
  });

  it("paginates using page/pageSize and keeps total as unpaginated count", async () => {
    // Arrange
    await customerFactory.create({
      availableCredit: 10,
    });
    await customerFactory.create({
      availableCredit: 10,
    });
    await customerFactory.create({
      availableCredit: 30,
    });

    // Act
    const page2 = await useCase.execute({
      sortBy: "availableCredit",
      sortOrder: "asc",
      page: 2,
      pageSize: 2,
    });

    // Assert
    expect(page2.total).toBe(3);
    expect(page2.customers).toHaveLength(1);
    expect(page2.customers[0].availableCredit).toBe(30);
  });

  it("normalizes page=0/pageSize=0 to page=1/pageSize=1", async () => {
    // Arrange
    await customerFactory.create({
      availableCredit: 10,
    });
    await customerFactory.create({
      availableCredit: 10,
    });
    await customerFactory.create({
      availableCredit: 30,
    });

    // Act
    const result = await useCase.execute({
      sortBy: "availableCredit",
      sortOrder: "asc",
      page: 0,
      pageSize: 0,
    });

    // Assert
    expect(result.total).toBe(3);
    expect(result.customers).toHaveLength(1);
    expect(result.customers[0].availableCredit).toBe(10);
  });

  it("does not return soft-deleted customers", async () => {
    // Arrange
    const a = await customerFactory.create({
      name: "Alive",
      availableCredit: 1,
    });
    const b = await customerFactory.create({
      name: "ToDelete",
      availableCredit: 2,
    });

    await TestDataSource.getRepository(CustomerOrmEntity).softDelete(b.id);

    // Act
    const result = await useCase.execute({
      sortBy: "createdAt",
      sortOrder: "asc",
      page: 1,
      pageSize: 10,
    });

    // Assert
    expect(result.total).toBe(1);
    expect(result.customers.map((c) => c.id)).toEqual([a.id]);
  });

  it("ignores invalid sortBy values (does not throw / does not inject)", async () => {
    // Arrange
    await customerFactory.create({ name: "Safe A", availableCredit: 1 });
    await customerFactory.create({ name: "Safe B", availableCredit: 2 });

    // Act
    const result = await repo.findAll({
      sortBy: 'name) DESC; DROP TABLE "customer"; --' as any,
      sortOrder: "desc" as any,
      page: 1,
      pageSize: 10,
    } as any);

    // Assert
    expect(result.total).toBe(2);
    expect(result.customers).toHaveLength(2);
  });

  it("defaults invalid sortOrder to ASC", async () => {
    // Arrange
    await customerFactory.create({ name: "Order Z", availableCredit: 1 });
    await customerFactory.create({ name: "Order A", availableCredit: 1 });

    // Act
    const result = await repo.findAll({
      sortBy: "name",
      sortOrder: "DROP" as any,
      page: 1,
      pageSize: 10,
    } as any);

    // Assert
    expect(result.total).toBe(2);
    expect(result.customers.map((c) => c.name)).toEqual(["Order A", "Order Z"]);
  });
});
