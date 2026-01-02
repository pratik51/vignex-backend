import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  create(@Body() createTradeDto: CreateTradeDto) {
    return this.tradesService.create(createTradeDto);
  }

  // Buyer clicked "Transferred, Notify Seller"
  @Patch(':id/confirm-payment')
  confirmPayment(@Param('id') id: string, @Body('buyerId') buyerId: number) {
    return this.tradesService.confirmPayment(+id, buyerId);
  }

  // Seller clicked "Payment Received"
  @Patch(':id/release')
  release(@Param('id') id: string, @Body('sellerId') sellerId: number) {
    return this.tradesService.releaseTrade(+id, sellerId);
  }

  // Cancel button (Manual)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body('userId') userId: number) {
    return this.tradesService.cancelTrade(+id, userId);
  }

  @Get()
  findAll() { return this.tradesService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.tradesService.findOne(+id); }
}