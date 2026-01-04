import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trade, TradeStatus } from './entities/trade.entity';
import { User } from '../users/entities/user.entity';
import { Ad } from '../ads/entities/ad.entity';
import { CreateTradeDto } from './dto/create-trade.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

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

    const taker = await this.usersRepository.findOneBy({ id: buyerId });
    if (!taker) throw new BadRequestException('User not found');

    // Logic: Determine who is Buyer vs Seller
    let tradeBuyer: User;
    let tradeSeller: User;

    if (ad.type === 'SELL') {
      tradeSeller = ad.seller;
      tradeBuyer = taker;
    } else {
      tradeBuyer = ad.seller;
      tradeSeller = taker;
    }

    if (!tradeSeller || !tradeBuyer) throw new BadRequestException('Invalid buyer/seller');

    const verifyDeadline = new Date();
    verifyDeadline.setMinutes(verifyDeadline.getMinutes() + (ad.verificationTimeLimit || 10));

    const trade = this.tradesRepository.create({
      amount,
      price: ad.price,
      status: TradeStatus.WAITING_VERIFICATION,
      verificationExpiresAt: verifyDeadline,
      seller: tradeSeller,
      buyer: tradeBuyer,
      ad: ad
    });

    if (Number(tradeSeller.usdtBalance) < amount) {
        throw new BadRequestException('Seller has insufficient balance');
    }
    
    tradeSeller.usdtBalance = Number(tradeSeller.usdtBalance) - amount;
    await this.usersRepository.save(tradeSeller);

    return await this.tradesRepository.save(trade);
  }

  // 2. VERIFY ORDER
  async verifyOrder(tradeId: number, userId: number) {
    const trade = await this.tradesRepository.findOne({ where: { id: tradeId }, relations: ['ad', 'seller', 'buyer'] });
    if (!trade) throw new NotFoundException('Trade not found');

    // Strict checks for relations
    if (!trade.ad || !trade.seller || !trade.buyer) throw new BadRequestException('Trade data incomplete');

    const isAdPoster = (trade.ad.type === 'SELL' && trade.seller.id === userId) || 
                       (trade.ad.type === 'BUY' && trade.buyer.id === userId);
    
    if (!isAdPoster) throw new BadRequestException('Only the Ad Poster can verify');

    const payDeadline = new Date();
    payDeadline.setMinutes(payDeadline.getMinutes() + (trade.ad.paymentTimeLimit || 15));

    trade.status = TradeStatus.PENDING_PAYMENT;
    trade.verifiedAt = new Date();
    trade.paymentExpiresAt = payDeadline;

    return await this.tradesRepository.save(trade);
  }

  // 3. EXTEND TIME
  async extendTime(tradeId: number, userId: number, minutes: number) {
    const trade = await this.tradesRepository.findOne({ where: { id: tradeId }, relations: ['ad', 'seller', 'buyer'] });
    if (!trade) throw new NotFoundException('Trade not found');
    if (!trade.ad || !trade.seller || !trade.buyer) throw new BadRequestException('Trade data incomplete');

    const isAdPoster = (trade.ad.type === 'SELL' && trade.seller.id === userId) || 
                       (trade.ad.type === 'BUY' && trade.buyer.id === userId);
    
    if (!isAdPoster) throw new BadRequestException('Only Merchant can extend time');

    // Handle potential null date
    const currentExpiry = trade.paymentExpiresAt ? new Date(trade.paymentExpiresAt) : new Date();
    currentExpiry.setMinutes(currentExpiry.getMinutes() + minutes);
    trade.paymentExpiresAt = currentExpiry;

    return await this.tradesRepository.save(trade);
  }

  // 4. CONFIRM PAYMENT
  async confirmPayment(tradeId: number, userId: number) {
    const trade = await this.tradesRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException('Trade not found');

    if (trade.status === TradeStatus.WAITING_VERIFICATION) throw new BadRequestException('Merchant must verify order first');
    
    trade.status = TradeStatus.PAID;
    trade.paymentConfirmedAt = new Date();
    return await this.tradesRepository.save(trade);
  }

  // 5. RELEASE TRADE
  async releaseTrade(tradeId: number, userId: number) {
     const trade = await this.tradesRepository.findOne({ where: { id: tradeId }, relations: ['seller', 'buyer'] });
     if (!trade) throw new NotFoundException('Trade not found');
     if (!trade.seller || !trade.buyer) throw new BadRequestException('Trade participants missing');

     if (trade.seller.id !== userId) throw new BadRequestException('Only seller can release');
     
     const buyer = await this.usersRepository.findOneBy({ id: trade.buyer.id });
     if (!buyer) throw new NotFoundException('Buyer not found');

     buyer.usdtBalance = Number(buyer.usdtBalance) + Number(trade.amount);
     await this.usersRepository.save(buyer);

     trade.status = TradeStatus.COMPLETED;
     trade.completedAt = new Date();
     return await this.tradesRepository.save(trade);
  }

  // 6. CANCEL TRADE
  async cancelTrade(tradeId: number, userId: number) {
    const trade = await this.tradesRepository.findOne({ where: { id: tradeId }, relations: ['seller', 'buyer', 'ad'] });
    if (!trade) throw new NotFoundException('Trade not found');
    if (!trade.ad || !trade.seller || !trade.buyer) throw new BadRequestException('Trade data incomplete');

    const isAdPoster = (trade.ad.type === 'SELL' && trade.seller.id === userId) || 
                       (trade.ad.type === 'BUY' && trade.buyer.id === userId);

    if (isAdPoster) throw new BadRequestException('Ad Poster cannot cancel. Only the customer can.');

    trade.status = TradeStatus.CANCELLED;
    
    // Refund Seller
    const seller = await this.usersRepository.findOneBy({ id: trade.seller.id });
    if (seller) {
        seller.usdtBalance = Number(seller.usdtBalance) + Number(trade.amount);
        await this.usersRepository.save(seller);
    }

    return await this.tradesRepository.save(trade);
  }

  // 7. APPEAL
  async appealTrade(tradeId: number, userId: number) {
     const trade = await this.tradesRepository.findOne({ where: { id: tradeId } });
     if (!trade) throw new NotFoundException('Trade not found');

     trade.status = TradeStatus.IN_APPEAL;
     return await this.tradesRepository.save(trade);
  }

  // CRON JOB
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const now = new Date();
    const expiredVerif = await this.tradesRepository.createQueryBuilder('trade')
      .where('trade.status = :s', { s: TradeStatus.WAITING_VERIFICATION })
      .andWhere('trade.verificationExpiresAt < :now', { now })
      .leftJoinAndSelect('trade.seller', 'seller')
      .getMany();

    for (const t of expiredVerif) {
      if (!t.seller) continue; // Skip if corrupt data

      t.status = TradeStatus.CANCELLED;
      const seller = await this.usersRepository.findOneBy({ id: t.seller.id });
      if (seller) {
        seller.usdtBalance = Number(seller.usdtBalance) + Number(t.amount);
        await this.usersRepository.save(seller);
      }
      await this.tradesRepository.save(t);
      console.log(`Auto-cancelled Trade #${t.id}`);
    }
  }
  
  findAll() {
    return this.tradesRepository.find({ relations: ['buyer', 'seller', 'ad'] });
  }

  async findMerchantTrades(userId: number) {
     return this.tradesRepository.find({
        where: { ad: { seller: { id: userId } } },
        relations: ['buyer', 'seller', 'ad'],
        order: { createdAt: 'DESC' }
     });
  }
}