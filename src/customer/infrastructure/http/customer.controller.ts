import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
  Get,
  Param,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiCreatedResponse,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
} from "@nestjs/swagger";

import { CreateCustomerUseCase } from "../../application/use-cases/create-customer.use-case";
import { CreateCustomerRequestDto } from "./dto/create-customer.request.dto";
import { FindCustomerByIdUseCase } from "../../application/use-cases/find-customer-by-id.use-case";
import { CustomerDto } from "./dto";
import { CustomerNotFoundError } from "../errors";
import { CustomerAlreadyExistsEmailPhoneNumberError } from "../../domain/errors";

@ApiTags("Customers")
@Controller("customers")
export class CustomerController {
  constructor(
    @Inject(CreateCustomerUseCase)
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    @Inject(FindCustomerByIdUseCase)
    private readonly findByIdCustomerUseCase: FindCustomerByIdUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: "Customer created successfully" })
  @ApiBody({ type: CreateCustomerRequestDto })
  async createCustomer(
    @Body() createCustomerRequestDto: CreateCustomerRequestDto
  ) {
    try {
      await this.createCustomerUseCase.execute(createCustomerRequestDto);
    } catch (error) {
      if (error instanceof CustomerAlreadyExistsEmailPhoneNumberError) {
        throw new ConflictException({
          message: error.message,
          code: error.code,
        });
      }
      throw error;
    }
    return;
  }

  @Get("/:id")
  @ApiOkResponse({ description: "Customer found successfully" })
  @ApiParam({ name: "id", description: "The id of the customer", example: "1" })
  @ApiResponse({
    status: 200,
    description: "Customer found successfully",
    type: CustomerDto,
  })
  async findCustomerById(@Param("id") id: string) {
    const customerFound = await this.findByIdCustomerUseCase.execute(
      Number(id)
    );

    if (!customerFound) {
      const error = new CustomerNotFoundError(Number(id));
      throw new NotFoundException({ message: error.message, code: error.code });
    }

    return customerFound;
  }
}
