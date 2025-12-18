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

  /**
   * PhoneNumber VO expects E.164 (digits only, optional leading '+').
   * Faker "international" formats can include spaces, parentheses, etc.
   */
  private e164PhoneNumber(
    countryCode = "34",
    nationalNumberLength = 9
  ): string {
    const digits = faker.string.numeric(nationalNumberLength);
    const normalizedDigits = digits[0] === "0" ? `1${digits.slice(1)}` : digits;
    return `+${countryCode}${normalizedDigits}`;
  }

  protected attrs(): FactorizedAttrs<CustomerOrmEntity> {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phoneNumber: this.e164PhoneNumber(),
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
