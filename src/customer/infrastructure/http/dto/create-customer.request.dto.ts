import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsPositive,
} from "class-validator";

export class CreateCustomerRequestDto {
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
}
