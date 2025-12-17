import { Controller, Post, Body, HttpCode, HttpStatus, Inject } from "@nestjs/common";
import { ApiTags, ApiCreatedResponse } from "@nestjs/swagger";

import { CreateCustomerUseCase } from "../../application/use-cases/create-customer.use-case";
import { CreateCustomerRequestDto } from "./dto/create-customer.request.dto";

@ApiTags("Customers")
@Controller("customers")
export class CustomerController {
  // NOTE: This @Inject is important for Lambda builds bundled with esbuild (serverless-esbuild).
  // esbuild does not emit TS `design:paramtypes` metadata, so type-based DI can silently become undefined.
  constructor(
    @Inject(CreateCustomerUseCase)
    private readonly createCustomerUseCase: CreateCustomerUseCase
  ) {}

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
