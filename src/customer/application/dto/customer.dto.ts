export interface CustomerDto {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  availableCredit: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
