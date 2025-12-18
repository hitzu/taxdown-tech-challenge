import { AddAvailableCreditCustomerUseCase } from "../use-cases/add-available-credit-customer.use-case";
import {
  buildCustomer,
  InMemoryCustomerRepository,
} from "../../../../test/utils/in-memory-customer-repository";
import { CustomerNotFoundError } from "../../domain/errors";

describe("AddAvailableCreditCustomerUseCase", () => {
  it("adds available credit to a customer", async () => {
    const repo = new InMemoryCustomerRepository();
    const useCase = new AddAvailableCreditCustomerUseCase(repo);
    await repo.save(buildCustomer(1));

    const result = await useCase.execute({ id: 1, amount: 100 });

    expect(result).toBeUndefined();
  });

  it("returns null when the customer does not exist", async () => {
    const repo = new InMemoryCustomerRepository();
    const useCase = new AddAvailableCreditCustomerUseCase(repo);

    await expect(
      useCase.execute({ id: 99, amount: 100 })
    ).rejects.toBeInstanceOf(CustomerNotFoundError);
  });
});
