import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateAdDto {
  @IsNotEmpty()
  sellerId: number;

  @IsEnum(['BUY', 'SELL'])
  type: 'BUY' | 'SELL';

  @IsEnum(['FIXED', 'FLOATING'])
  priceType: 'FIXED' | 'FLOATING';

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  floatingMargin?: number;

  @IsNumber()
  amount: number; // initialAmount

  @IsNumber()
  minLimit: number;

  @IsNumber()
  maxLimit: number;

  @IsString()
  paymentMethod: string;

  // --- NEW FIELDS ---
  @IsOptional()
  @IsNumber()
  verificationTimeLimit?: number;

  @IsOptional()
  @IsNumber()
  paymentTimeLimit?: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  autoReply?: string;
}