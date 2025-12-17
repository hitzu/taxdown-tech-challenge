export interface CreateCustomerInputDto {
  name: string;
  email: string;
  phoneNumber: string;
  initialAvailableCredit: number;
}

export interface CreateCustomerOutputDto {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  availableCredit: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
