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
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiCreatedResponse,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";

import { CreateCustomerUseCase } from "../../application/use-cases/create-customer.use-case";
import { FindCustomerByIdUseCase } from "../../application/use-cases/find-customer-by-id.use-case";
import { FindAllCustomerUseCase } from "../../application/use-cases/find-all-customer.use-case";

import { CreateCustomerRequestDto } from "./dto/create-customer.request.dto";
import {
  CustomerDto,
  FindAllCustomerRequestDto,
  FindAllCustomerResponseDto,
} from "./dto";
import { CustomerNotFoundError } from "../errors";
import { CustomerAlreadyExistsEmailPhoneNumberError } from "../../domain/errors";
import { ParseFindAllCustomersQueryPipe } from "./pipes/parse-find-all-customers-query.pipe";

@ApiTags("Customers")
@Controller("customers")
export class CustomerController {
  constructor(
    @Inject(CreateCustomerUseCase)
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    @Inject(FindCustomerByIdUseCase)
    private readonly findCustomerByIdUseCase: FindCustomerByIdUseCase,
    @Inject(FindAllCustomerUseCase)
    private readonly findAllCustomersUseCase: FindAllCustomerUseCase
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
    const customerFound = await this.findCustomerByIdUseCase.execute(
      Number(id)
    );

    if (!customerFound) {
      const error = new CustomerNotFoundError(Number(id));
      throw new NotFoundException({ message: error.message, code: error.code });
    }

    return customerFound;
  }

  @Get()
  @ApiOkResponse({ description: "Customers found successfully" })
  @ApiQuery({ type: FindAllCustomerRequestDto })
  @ApiResponse({
    status: 200,
    description: "Customers found successfully",
    type: FindAllCustomerResponseDto,
  })
  async findAllCustomers(
    @Query(new ParseFindAllCustomersQueryPipe())
    query: FindAllCustomerRequestDto
  ): Promise<FindAllCustomerResponseDto> {
    const {
      sortBy = "createdAt",
      sortOrder = "asc",
      page = 1,
      pageSize = 10,
    } = query;

    return await this.findAllCustomersUseCase.execute({
      sortBy,
      sortOrder,
      page,
      pageSize,
    });
  }
}
