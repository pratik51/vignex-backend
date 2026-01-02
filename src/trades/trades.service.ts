import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trade, TradeStatus } from './entities/trade.entity';
import { User } from '../users/entities/user.entity';
import { Ad } from '../ads/entities/ad.entity';
import { CreateTradeDto } from './dto/create-trade.dto';

@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(Trade) private tradesRepository: Repository<Trade>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Ad) private adsRepository: Repository<Ad>,
  ) {}

  // 1. CREATE TRADE
  async create(createTradeDto: CreateTradeDto) {
    const { adId, buyerId, amount } = createTradeDto;

    const ad = await this.adsRepository.findOne({ where: { id: adId }, relations: ['seller'] });
    if (!ad) throw new BadRequestException('Ad not found');
    if (ad.status !== 'OPEN') throw new BadRequestException('Ad is closed');
    
    // Check Limits
    const totalCostINR = amount * ad.price;
    if (ad.minLimit && totalCostINR < ad.minLimit) throw new BadRequestException(`Min order: ₹${ad.minLimit}`);
    if (ad.maxLimit && totalCostINR > ad.maxLimit) throw new BadRequestException(`Max order: ₹${ad.maxLimit}`);

    const seller = ad.seller;
    if (!seller) throw new BadRequestException('Seller user invalid'); // Check 1

    if (Number(seller.usdtBalance) < amount) {
      throw new BadRequestException('Seller insufficient funds');
    }

    // Lock Funds
    seller.usdtBalance = Number(seller.usdtBalance) - amount;
    await this.usersRepository.save(seller);

    // Reduce Ad Inventory
    ad.currentAmount = Number(ad.currentAmount) - amount;
    if (ad.currentAmount <= 0) ad.status = 'CLOSED';
    await this.adsRepository.save(ad);

    const newTrade = this.tradesRepository.create({
      amount,
      price: ad.price,
      status: TradeStatus.PENDING_PAYMENT,
      seller: seller,
      buyer: { id: buyerId } as User, // Cast to help TS
      ad: ad
    });

    return await this.tradesRepository.save(newTrade);
  }

  // 2. CONFIRM PAYMENT (Buyer)
  async confirmPayment(tradeId: number, buyerId: number) {
    const trade = await this.tradesRepository.findOne({ where: { id: tradeId }, relations: ['buyer'] });
    if (!trade) throw new NotFoundException('Trade not found');
    if (!trade.buyer) throw new BadRequestException('Trade has no buyer linked'); // Check 2

    if (trade.buyer.id !== buyerId) throw new BadRequestException('Not authorized');
    if (trade.status !== TradeStatus.PENDING_PAYMENT) throw new BadRequestException('Wrong status');

    trade.status = TradeStatus.PAID;
    return await this.tradesRepository.save(trade);
  }

  // 3. RELEASE FUNDS (Seller)
  async releaseTrade(tradeId: number, sellerId: number) {
    const trade = await this.tradesRepository.findOne({ where: { id: tradeId }, relations: ['buyer', 'seller'] });
    if (!trade) throw new NotFoundException('Trade not found');
    if (!trade.seller) throw new BadRequestException('Trade has no seller');
    if (!trade.buyer) throw new BadRequestException('Trade has no buyer'); // Check 3

    if (trade.seller.id !== sellerId) throw new BadRequestException('Not authorized');
    if (trade.status === TradeStatus.COMPLETED) throw new BadRequestException('Already completed');

    // Transfer to Buyer
    // Re-fetch buyer to ensure we have latest balance
    const buyer = await this.usersRepository.findOneBy({ id: trade.buyer.id });
    if (!buyer) throw new BadRequestException('Buyer user not found'); // Check 4

    buyer.usdtBalance = Number(buyer.usdtBalance) + Number(trade.amount);
    await this.usersRepository.save(buyer);

    trade.status = TradeStatus.COMPLETED;
    return await this.tradesRepository.save(trade);
  }

  // 4. CANCEL
  async cancelTrade(tradeId: number, userId: number) {
    const trade = await this.tradesRepository.findOne({ where: { id: tradeId }, relations: ['seller'] });
    if (!trade) throw new NotFoundException('Trade not found');
    if (!trade.seller) throw new BadRequestException('Trade has no seller'); // Check 5

    if (trade.status === TradeStatus.COMPLETED) throw new BadRequestException('Cannot cancel completed trade');

    // Refund Seller
    const seller = await this.usersRepository.findOneBy({ id: trade.seller.id });
    if (!seller) throw new BadRequestException('Seller user not found'); // Check 6

    seller.usdtBalance = Number(seller.usdtBalance) + Number(trade.amount);
    await this.usersRepository.save(seller);

    trade.status = TradeStatus.CANCELLED;
    return await this.tradesRepository.save(trade);
  }

  findAll() { return this.tradesRepository.find({ relations: ['seller', 'buyer', 'ad'] }); }
  findOne(id: number) { return this.tradesRepository.findOne({ where: { id }, relations: ['seller', 'buyer', 'ad'] }); }
}