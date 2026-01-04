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
    if (ad.minLimit && totalCostINR < Number(ad.minLimit)) throw new BadRequestException(`Min order: ₹${ad.minLimit}`);
    if (ad.maxLimit && totalCostINR > Number(ad.maxLimit)) throw new BadRequestException(`Max order: ₹${ad.maxLimit}`);

    const seller = ad.seller;
    if (!seller) throw new BadRequestException('Seller user invalid');

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
      buyer: { id: buyerId } as User,
      ad: ad
    });

    return await this.tradesRepository.save(newTrade);
  }

  // 2. CONFIRM PAYMENT (Buyer)
  async confirmPayment(tradeId: number, buyerId: number) {
    const trade = await this.tradesRepository.findOne({ where: { id: tradeId }, relations: ['buyer'] });
    if (!trade) throw new NotFoundException('Trade not found');
    if (!trade.buyer) throw new BadRequestException('Trade has no buyer linked');

    if (trade.buyer.id !== buyerId) throw new BadRequestException('Not authorized');
    if (trade.status !== TradeStatus.PENDING_PAYMENT) throw new BadRequestException('Wrong status');

    trade.status = TradeStatus.PAID;
    
    // CAPTURE TIME
    trade.paymentConfirmedAt = new Date(); 

    return await this.tradesRepository.save(trade);
  }

  // 3. RELEASE FUNDS (Seller) - FIXED NULL CHECK
  async releaseTrade(tradeId: number, sellerId: number) {
    const trade = await this.tradesRepository.findOne({ where: { id: tradeId }, relations: ['buyer', 'seller'] });
    if (!trade) throw new NotFoundException('Trade not found');
    if (!trade.seller) throw new BadRequestException('Trade has no seller');
    if (!trade.buyer) throw new BadRequestException('Trade has no buyer');

    if (trade.seller.id !== sellerId) throw new BadRequestException('Not authorized');
    if (trade.status === TradeStatus.COMPLETED) throw new BadRequestException('Already completed');

    // Transfer to Buyer
    const buyer = await this.usersRepository.findOneBy({ id: trade.buyer.id });
    
    // --- FIX: Guard Clause ---
    if (!buyer) throw new NotFoundException('Buyer user not found'); 

    buyer.usdtBalance = Number(buyer.usdtBalance) + Number(trade.amount);
    await this.usersRepository.save(buyer);

    trade.status = TradeStatus.COMPLETED;
    trade.completedAt = new Date(); 
    await this.tradesRepository.save(trade);

    // Update Stats
    await this.updateUserStats(sellerId);

    return trade;
  }

  // 4. CANCEL - FIXED NULL CHECK
  async cancelTrade(tradeId: number, userId: number) {
    const trade = await this.tradesRepository.findOne({ where: { id: tradeId }, relations: ['seller'] });
    if (!trade) throw new NotFoundException('Trade not found');
    if (!trade.seller) throw new BadRequestException('Trade has no seller');

    if (trade.status === TradeStatus.COMPLETED) throw new BadRequestException('Cannot cancel completed trade');

    // Refund Seller
    const seller = await this.usersRepository.findOneBy({ id: trade.seller.id });
    
    // --- FIX: Guard Clause ---
    if (!seller) throw new NotFoundException('Seller user not found');

    seller.usdtBalance = Number(seller.usdtBalance) + Number(trade.amount);
    await this.usersRepository.save(seller);

    trade.status = TradeStatus.CANCELLED;
    await this.tradesRepository.save(trade);

    // Update Stats
    await this.updateUserStats(trade.seller.id);

    return trade;
  }

  // 5. APPEAL (Dispute)
  async appealTrade(tradeId: number, userId: number) {
    const trade = await this.tradesRepository.findOne({ where: { id: tradeId }, relations: ['seller', 'buyer'] });
    if (!trade) throw new NotFoundException('Trade not found');

    if (trade.status !== TradeStatus.PAID) {
      throw new BadRequestException('Can only appeal after payment is marked');
    }

    // Allow either Buyer or Seller to appeal
    if (trade.buyer.id !== userId && trade.seller.id !== userId) {
      throw new BadRequestException('Not authorized to appeal this trade');
    }

    trade.status = TradeStatus.IN_APPEAL;
    return await this.tradesRepository.save(trade);
  }

  // --- ALGORITHM: CALCULATE STATS (SECONDS) ---
  private async updateUserStats(userId: number) {
    const trades = await this.tradesRepository.find({
      where: [{ seller: { id: userId } }],
      order: { createdAt: 'DESC' },
      take: 50
    });

    if (trades.length === 0) return;

    // A. Completion Rate
    const completedCount = trades.filter(t => t.status === TradeStatus.COMPLETED).length;
    const completionRate = (completedCount / trades.length) * 100;

    // B. Average Release Time (SECONDS)
    const validTrades = trades.filter(t => 
      t.status === TradeStatus.COMPLETED && 
      t.paymentConfirmedAt && 
      t.completedAt
    );

    let totalSeconds = 0;
    validTrades.forEach(t => {
      // Ensure timestamps exist
      if (t.completedAt && t.paymentConfirmedAt) {
        const diffMs = t.completedAt.getTime() - t.paymentConfirmedAt.getTime();
        const seconds = diffMs / 1000; // Convert ms to seconds
        totalSeconds += seconds;
      }
    });

    const avgSeconds = validTrades.length > 0 ? (totalSeconds / validTrades.length) : 0;

    // Update User Entity
    const user = await this.usersRepository.findOneBy({ id: userId });
    
    // --- FIX: Guard Clause ---
    if (user) {
      user.completionRate = completionRate;
      user.avgReleaseTimeSeconds = avgSeconds; // Saving Seconds
      user.totalTrades = trades.length; 
      await this.usersRepository.save(user);
    }
  }

  findAll() { return this.tradesRepository.find({ relations: ['seller', 'buyer', 'ad'] }); }
  findOne(id: number) { return this.tradesRepository.findOne({ where: { id }, relations: ['seller', 'buyer', 'ad'] }); }
}