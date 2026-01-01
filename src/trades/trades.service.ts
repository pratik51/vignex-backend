import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trade } from './entities/trade.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(Trade)
    private tradesRepository: Repository<Trade>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createTradeDto: CreateTradeDto) {
    const { sellerId, buyerId, amount } = createTradeDto;

    console.log(`[VIGNEX SECURITY] Attempting trade for ${amount} USDT...`);

    // 1. Find the Seller
    const seller = await this.usersRepository.findOneBy({ id: sellerId });
    if (!seller) throw new BadRequestException('Seller not found');

    // 2. CHECK BALANCE (Paranoid Mode)
    let currentBalance = Number(seller.usdtBalance);
    if (isNaN(currentBalance)) {
        currentBalance = 0;
    }
    
    console.log(`[VIGNEX SECURITY] Seller Clean Balance is: ${currentBalance}`);

    if (currentBalance < amount) {
      console.log(`[VIGNEX SECURITY] BLOCKED: Insufficient Funds`);
      throw new BadRequestException(`Insufficient Balance! You only have ${currentBalance} USDT.`);
    }

    // 3. LOCK FUNDS
    seller.usdtBalance = currentBalance - amount;
    await this.usersRepository.save(seller);

    // 4. Create Trade
    const newTrade = this.tradesRepository.create({
      amount: amount,
      status: 'PENDING',
      seller: { id: sellerId },
      buyer: { id: buyerId },
    });

    console.log(`[VIGNEX SECURITY] SUCCESS: Funds Locked.`);
    return await this.tradesRepository.save(newTrade);
  }

  findAll() {
    return this.tradesRepository.find({ relations: ['seller', 'buyer'] });
  }

  findOne(id: number) {
    return this.tradesRepository.findOne({ where: { id }, relations: ['seller', 'buyer'] });
  }

  // --- RELEASE FUNDS (Fixed) ---
  async releaseTrade(tradeId: number) {
    // 1. Find the Trade
    const trade = await this.tradesRepository.findOne({ 
      where: { id: tradeId },
      relations: ['buyer', 'seller'] 
    });

    if (!trade) throw new BadRequestException('Trade not found');
    if (trade.status === 'COMPLETED') throw new BadRequestException('Trade already completed');

    console.log(`[VIGNEX RELEASE] Releasing Trade #${tradeId} of ${trade.amount} USDT...`);

    // 2. GIVE MONEY TO BUYER
    // Check if buyer exists before doing math!
    const buyer = await this.usersRepository.findOneBy({ id: trade.buyer.id });
    
    if (!buyer) {
        throw new BadRequestException('CRITICAL ERROR: Buyer account missing!');
    }
    
    // Safety check for NaN
    let currentBalance = Number(buyer.usdtBalance);
    if (isNaN(currentBalance)) currentBalance = 0;

    buyer.usdtBalance = currentBalance + Number(trade.amount);
    await this.usersRepository.save(buyer); // Now TypeScript knows 'buyer' is definitely not null

    // 3. UPDATE TRADE STATUS
    trade.status = 'COMPLETED';
    return await this.tradesRepository.save(trade);
  }

  update(id: number, updateTradeDto: any) { return `This action updates a #${id} trade`; }
  remove(id: number) { return `This action removes a #${id} trade`; }
}