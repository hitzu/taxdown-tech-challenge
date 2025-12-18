import type { FactorizedAttrs } from "@jorgebodega/typeorm-factory";
import { Factory } from "@jorgebodega/typeorm-factory";
import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";

import { CustomerOrmEntity } from "../../src/customer/infrastructure/persistence/customer.orm-entity";

export class CustomerFactory extends Factory<CustomerOrmEntity> {
  protected entity = CustomerOrmEntity;
  protected dataSource: DataSource;

  constructor(dataSource: DataSource) {
    super();
    this.dataSource = dataSource;
  }

  protected attrs(): FactorizedAttrs<CustomerOrmEntity> {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.number({ style: "international" }) as string,
      availableCredit: faker.number.int({ min: 0, max: 1000 }),
    };
  }

  async create(
    overrides?: Partial<FactorizedAttrs<CustomerOrmEntity>>
  ): Promise<CustomerOrmEntity> {
    const entity = await this.make(overrides);
    return this.dataSource.manager.save(entity);
  }
}
