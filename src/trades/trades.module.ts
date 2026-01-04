import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';
import { Trade } from './entities/trade.entity';
import { User } from '../users/entities/user.entity';
import { Ad } from '../ads/entities/ad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trade, User, Ad])], // <--- Ensure all 3 are here
  controllers: [TradesController],
  providers: [TradesService],
})
export class TradesModule {}