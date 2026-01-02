import { Injectable, BadRequestException } from '@nestjs/common';
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
    // Destructure the new limit fields from the DTO
    const { sellerId, price, amount, paymentMethod, minLimit, maxLimit } = createAdDto;

    // Check if seller exists
    const seller = await this.usersRepository.findOneBy({ id: sellerId });
    if (!seller) throw new BadRequestException('Seller not found');

    // Check Balance (Don't let them post ads if they are broke)
    if (Number(seller.usdtBalance) < amount) {
        throw new BadRequestException('Insufficient Balance to post this ad');
    }

    const ad = this.adsRepository.create({
      seller,
      price,
      initialAmount: amount,
      currentAmount: amount,
      paymentMethod,
      minLimit: minLimit || 0, // Save the minimum INR limit
      maxLimit: maxLimit || 0, // Save the maximum INR limit
      status: 'OPEN'
    });

    return await this.adsRepository.save(ad);
  }

  // 2. SHOW ALL OPEN ADS (The Order Book)
  findAll() {
    return this.adsRepository.find({
      where: { status: 'OPEN' },
      relations: ['seller'],
      order: { price: 'ASC' } // Cheapest first (like Binance)
    });
  }

  findOne(id: number) {
    return this.adsRepository.findOne({ where: { id }, relations: ['seller'] });
  }
}