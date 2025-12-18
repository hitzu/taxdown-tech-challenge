import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import { CustomerOrmEntity } from "./customer.orm-entity";
import { CustomerId, Email, PhoneNumber } from "../../domain/value-objects";
import { Customer } from "../../domain/entities/customer.entity";

@Injectable()
export class CustomerRepositoryAdapter implements CustomerRepositoryPort {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly repo: Repository<CustomerOrmEntity>
  ) {}

  async findById(id: CustomerId): Promise<Customer | null> {
    const customer = await this.repo.findOne({ where: { id: id.getValue() } });
    return customer ? CustomerOrmEntity.toDomain(customer) : null;
  }

  async findAll(): Promise<Customer[]> {
    const entities = await this.repo.find();
    return entities.map(CustomerOrmEntity.toDomain);
  }

  async save(customer: Customer): Promise<Customer> {
    const orm = CustomerOrmEntity.fromDomain(customer);

    const saved = await this.repo.save(orm);
    return CustomerOrmEntity.toDomain(saved);
  }

  async delete(id: CustomerId): Promise<void> {
    await this.repo.softDelete(id.getValue());
  }

  async findByEmailAndPhoneNumber(
    email: Email,
    phoneNumber: PhoneNumber
  ): Promise<Customer | null> {
    const customer = await this.repo.findOne({
      where: { email: email.getValue(), phoneNumber: phoneNumber.getValue() },
    });
    return customer ? CustomerOrmEntity.toDomain(customer) : null;
  }
}
