import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  Min,
  IsOptional,
} from "class-validator";

export class UpdateCustomerRequestDto {
  @ApiProperty({
    description: "The name of the customer",
    example: "John Doe",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: "The email of the customer",
    example: "john.doe@example.com",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: "The phone number of the customer",
    example: "+34600123456",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phoneNumber?: string;

  @ApiProperty({
    description: "The available credit of the customer",
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  availableCredit?: number;
}
