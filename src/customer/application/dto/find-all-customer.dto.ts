import { CustomerDto } from "./customer.dto";

export interface FindAllCustomerInputDto {
  sortBy: "availableCredit" | "name" | "createdAt";
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface FindAllCustomerOutputDto {
  customers: CustomerDto[];
  total: number;
}
