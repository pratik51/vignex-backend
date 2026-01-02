import { PaymentMethod } from '../entities/ad.entity'; // Import the Enum

export class CreateAdDto {
  sellerId: number;
  price: number;
  amount: number;
  minLimit: number;
  maxLimit: number;
  paymentMethod: PaymentMethod; // <--- Enforces the Dropdown
}