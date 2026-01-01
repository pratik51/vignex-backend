import { ApiProperty } from '@nestjs/swagger';

export class DepositUserDto {
  @ApiProperty({ example: 1000, description: 'Amount of USDT to deposit' })
  amount: number;
}