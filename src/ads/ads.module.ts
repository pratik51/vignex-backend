import { Module } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ad } from './entities/ad.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ad, User])], // <--- IMPORT ENTITIES
  controllers: [AdsController],
  providers: [AdsService],
  exports: [AdsService] // Export so Trades can use it later
})
export class AdsModule {}