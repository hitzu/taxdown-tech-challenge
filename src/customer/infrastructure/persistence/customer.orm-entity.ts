import { Entity, Column } from "typeorm";
import { BaseOrmEntity } from "../../../shared/persistence/base.orm-entity";
import { Customer } from "../../domain/entities/customer.entity";
import {
  CustomerId,
  Email,
  PhoneNumber,
  AvailableCredit,
} from "../../domain/value-objects";
import { DB_SCHEMA } from "../../../shared/persistence/db-config";

@Entity({
  name: "customers",
  schema: DB_SCHEMA,
})
export class CustomerOrmEntity extends BaseOrmEntity {
  @Column({
    type: "varchar",
    length: 255,
    name: "name",
  })
  name!: string;

  @Column({
    type: "varchar",
    length: 255,
    name: "email",
  })
  email!: string;

  @Column({
    type: "varchar",
    length: 255,
    name: "phone_number",
  })
  phoneNumber!: string;

  @Column({
    type: "numeric",
    name: "available_credit",
  })
  availableCredit!: number;

  // ── Mapping: ORM → Domain ───────────────────────────────

  static toDomain(entity: CustomerOrmEntity): Customer {
    return Customer.restore({
      id: CustomerId.from(entity.id),
      name: entity.name,
      email: Email.from(entity.email),
      phoneNumber: PhoneNumber.from(entity.phoneNumber),
      availableCredit: AvailableCredit.from(Number(entity.availableCredit)),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  // ── Mapping: Domain → ORM ───────────────────────────────

  static fromDomain(customer: Customer): CustomerOrmEntity {
    const orm = new CustomerOrmEntity();
    // id puede venir undefined si es un Customer recién creado
    const id = customer.id?.getValue?.();
    if (id) {
      orm.id = id;
    }

    orm.name = customer.name;
    orm.email = customer.email.getValue();
    orm.phoneNumber = customer.phoneNumber.getValue();
    orm.availableCredit = customer.availableCredit.getValue();
    orm.createdAt = customer.createdAt;
    orm.updatedAt = customer.updatedAt;
    orm.deletedAt = null;

    return orm;
  }
}
