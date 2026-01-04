export class CreateAdDto {
  sellerId: number;
  type: 'BUY' | 'SELL';
  priceType: 'FIXED' | 'FLOATING';
  price: number;
  floatingMargin?: number;
  amount: number;
  minLimit: number;
  maxLimit: number;
  paymentMethod: string; // Now accepts "UPI,IMPS" string
  paymentTimeLimit: number;
  remarks?: string;
  autoReply?: string;
}