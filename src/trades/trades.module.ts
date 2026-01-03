import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';
import { Trade } from './entities/trade.entity';
import { User } from '../users/entities/user.entity';
import { Ad } from '../ads/entities/ad.entity'; // <--- 1. Import Ad

@Module({
  // 2. Add Ad to the list below
  imports: [TypeOrmModule.forFeature([Trade, User, Ad])], 
  controllers: [TradesController],
  providers: [TradesService],
})
export class TradesModule {}