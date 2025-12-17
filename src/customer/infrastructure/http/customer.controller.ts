import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiCreatedResponse } from "@nestjs/swagger";

import { CreateCustomerUseCase } from "../../application/use-cases/create-customer.use-case";
import { CreateCustomerRequestDto } from "./dto/create-customer.request.dto";

@ApiTags("Customers")
@Controller("customers")
export class CustomerController {
  constructor(private readonly createCustomerUseCase: CreateCustomerUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: "Customer created successfully" })
  async createCustomer(
    @Body() createCustomerRequestDto: CreateCustomerRequestDto
  ) {
    await this.createCustomerUseCase.execute(createCustomerRequestDto);
    return;
  }
}
