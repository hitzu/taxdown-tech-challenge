import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsPositive,
  IsDate,
} from "class-validator";

export class CustomerDto {
  @ApiProperty({
    description: "The id of the customer",
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  id!: number;

  @ApiProperty({
    description: "The name of the customer",
    example: "John Doe",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "The email of the customer",
    example: "john.doe@example.com",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: "The phone number of the customer",
    example: "+34600123456",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty({
    description: "The initial available credit of the customer",
    example: 100,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  initialAvailableCredit!: number;

  @ApiProperty({
    description: "The created at date of the customer",
    example: "2021-01-01T00:00:00.000Z",
    required: true,
  })
  @IsDate()
  @IsNotEmpty()
  createdAt!: Date;

  @ApiProperty({
    description: "The updated at date of the customer",
    example: "2021-01-01T00:00:00.000Z",
    required: true,
  })
  @IsDate()
  @IsNotEmpty()
  updatedAt!: Date;

  @ApiProperty({
    description: "The deleted at date of the customer",
    example: "2021-01-01T00:00:00.000Z",
    required: true,
  })
  @IsDate()
  deletedAt!: Date | null;
}
