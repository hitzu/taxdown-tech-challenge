import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsIn,
  IsInt,
  Min,
} from "class-validator";
import { CustomerDto } from "./customer.dto";

const toPositiveIntOrUndefined = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;

  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 1) return undefined;
    return value;
  }

  if (typeof value !== "string") return undefined;
  if (!/^\d+$/.test(value)) return undefined;

  const parsed = Number.parseInt(value, 10);
  if (parsed < 1) return undefined;
  return parsed;
};

export class FindAllCustomerRequestDto {
  @ApiProperty({
    description: "The field to sort by",
    example: "availableCredit",
    required: false,
    enum: ["availableCredit", "name", "createdAt"],
  })
  @IsString()
  @IsIn(["availableCredit", "name", "createdAt"])
  @IsOptional()
  sortBy?: "availableCredit" | "name" | "createdAt";

  @ApiProperty({
    description: "The order to sort by",
    example: "asc",
    required: false,
    enum: ["asc", "desc"],
  })
  @IsString()
  @IsIn(["asc", "desc"])
  @IsOptional()
  sortOrder?: "asc" | "desc";

  @ApiProperty({
    description: "The page number",
    example: 1,
    required: false,
  })
  @Transform(({ value }) => toPositiveIntOrUndefined(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: "The number of items per page",
    example: 10,
    required: false,
  })
  @Transform(({ value }) => toPositiveIntOrUndefined(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number;
}

export class FindAllCustomerResponseDto {
  @ApiProperty({
    description: "The customers",
    example: [],
    required: true,
  })
  @IsArray()
  @IsNotEmpty()
  customers!: CustomerDto[];

  @ApiProperty({
    description: "The total number of customers",
    example: 10,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  total!: number;
}
