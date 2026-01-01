import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';
import { Trade } from './entities/trade.entity';
import { User } from '../users/entities/user.entity'; // <--- Import User

@Module({
  imports: [TypeOrmModule.forFeature([Trade, User])], // <--- Allow access to both tables
  controllers: [TradesController],
  providers: [TradesService],
})
export class TradesModule {}