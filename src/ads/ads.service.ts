import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAdDto } from './dto/create-ad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ad } from './entities/ad.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Ad) private adsRepository: Repository<Ad>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  // 1. POST A NEW AD
  async create(createAdDto: CreateAdDto) {
    const { 
      sellerId, price, amount, paymentMethod, minLimit, maxLimit,
      type, priceType, floatingMargin, paymentTimeLimit, remarks, autoReply
    } = createAdDto;

    const seller = await this.usersRepository.findOneBy({ id: sellerId });
    if (!seller) throw new BadRequestException('Seller not found');

    // FLOATING PRICE LOGIC
    let finalPrice = price;
    if (priceType === 'FLOATING' && floatingMargin) {
       const marketPrice = 88.00; // Mock Market Price
       finalPrice = marketPrice * (floatingMargin / 100);
    }

    // BALANCE CHECK
    if (type === 'SELL' && Number(seller.usdtBalance) < amount) {
        throw new BadRequestException('Insufficient Balance to post this ad');
    }

    const ad = this.adsRepository.create({
      seller,
      type,
      priceType,
      price: finalPrice,
      floatingMargin,
      initialAmount: amount,
      currentAmount: amount,
      paymentMethod,
      minLimit: minLimit || 0,
      maxLimit: maxLimit || 0,
      paymentTimeLimit: paymentTimeLimit || 15,
      remarks,
      autoReply,
      status: 'OPEN'
    });

    return await this.adsRepository.save(ad);
  }

  // 2. SHOW ALL OPEN ADS (Public Market)
  findAll() {
    return this.adsRepository.find({
      where: { status: 'OPEN' },
      relations: ['seller'],
      order: { price: 'ASC' }
    });
  }

  findOne(id: number) {
    return this.adsRepository.findOne({ where: { id }, relations: ['seller'] });
  }

  // --- NEW DASHBOARD METHODS ---

  // 3. GET MY ADS
  async findMyAds(sellerId: number) {
    return this.adsRepository.find({
      where: { seller: { id: sellerId } },
      order: { createdAt: 'DESC' }
    });
  }

  // 4. TOGGLE STATUS (Pause/Resume)
  async toggleStatus(id: number, userId: number) {
    const ad = await this.adsRepository.findOne({ where: { id }, relations: ['seller'] });
    if (!ad) throw new NotFoundException('Ad not found');
    if (ad.seller.id !== userId) throw new BadRequestException('Not authorized');

    // Switch between OPEN and OFFLINE
    if (ad.status === 'OPEN') {
      ad.status = 'OFFLINE';
    } else {
      ad.status = 'OPEN';
    }
    return await this.adsRepository.save(ad);
  }

  // 5. DELETE AD
  async remove(id: number, userId: number) {
    const ad = await this.adsRepository.findOne({ where: { id }, relations: ['seller'] });
    if (!ad) throw new NotFoundException('Ad not found');
    if (ad.seller.id !== userId) throw new BadRequestException('Not authorized');

    return await this.adsRepository.remove(ad);
  }
}