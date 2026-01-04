import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  // 1. Create a new Trade
  @Post()
  create(@Body() createTradeDto: CreateTradeDto) {
    return this.tradesService.create(createTradeDto);
  }

  // 2. Get All Trades (Admin/Debug)
  @Get()
  findAll() {
    return this.tradesService.findAll();
  }
  
  // 3. Get Merchant Dashboard Trades (Incoming Orders)
  @Get('merchant/:userId')
  findMerchantTrades(@Param('userId') userId: string) {
    return this.tradesService.findMerchantTrades(+userId);
  }

  // 4. Merchant Verifies Order (Starts Timer 2)
  @Patch(':id/verify')
  verify(@Param('id') id: string, @Body('userId') userId: number) {
    return this.tradesService.verifyOrder(+id, userId);
  }

  // 5. Merchant Extends Time
  @Patch(':id/extend')
  extend(@Param('id') id: string, @Body() body: { userId: number, minutes: number }) {
    return this.tradesService.extendTime(+id, body.userId, body.minutes);
  }

  // 6. Buyer Confirms Payment
  @Patch(':id/confirm-payment')
  confirmPayment(@Param('id') id: string, @Body('buyerId') userId: number) {
    return this.tradesService.confirmPayment(+id, userId);
  }

  // 7. Seller Releases Crypto
  @Patch(':id/release')
  release(@Param('id') id: string, @Body('sellerId') userId: number) {
    return this.tradesService.releaseTrade(+id, userId);
  }

  // 8. Buyer Cancels
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body('userId') userId: number) {
    return this.tradesService.cancelTrade(+id, userId);
  }

  // 9. Raise Dispute
  @Patch(':id/appeal')
  appeal(@Param('id') id: string, @Body('userId') userId: number) {
    return this.tradesService.appealTrade(+id, userId);
  }
}