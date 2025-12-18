import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerController } from "./customer.controller";
import { CustomerOrmEntity } from "../persistence/customer.orm-entity";
import { CustomerRepositoryAdapter } from "../persistence/customer.repository.adapter";
import { CUSTOMER_REPOSITORY_TOKEN } from "../persistence/customer-repository.token";
import { CreateCustomerUseCase } from "../../application/use-cases/create-customer.use-case";
import { CustomerRepositoryPort } from "../../domain/ports/customer-repository.port";
import { FindCustomerByIdUseCase } from "../../application/use-cases/find-customer-by-id.use-case";
import { FindAllCustomerUseCase } from "../../application/use-cases/find-all-customer.use-case";

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrmEntity])],
  controllers: [CustomerController],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY_TOKEN,
      useClass: CustomerRepositoryAdapter,
    },
    {
      provide: CreateCustomerUseCase,
      useFactory: (customerRepository: CustomerRepositoryPort) =>
        new CreateCustomerUseCase(customerRepository),
      inject: [CUSTOMER_REPOSITORY_TOKEN],
    },
    {
      provide: FindCustomerByIdUseCase,
      useFactory: (customerRepository: CustomerRepositoryPort) =>
        new FindCustomerByIdUseCase(customerRepository),
      inject: [CUSTOMER_REPOSITORY_TOKEN],
    },
    {
      provide: FindAllCustomerUseCase,
      useFactory: (customerRepository: CustomerRepositoryPort) =>
        new FindAllCustomerUseCase(customerRepository),
      inject: [CUSTOMER_REPOSITORY_TOKEN],
    },
  ],
  exports: [CreateCustomerUseCase],
})
export class CustomerModule {}
