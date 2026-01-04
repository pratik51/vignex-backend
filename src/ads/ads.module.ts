import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { Ad } from './entities/ad.entity';
import { User } from '../users/entities/user.entity'; // <--- Import User

@Module({
  imports: [TypeOrmModule.forFeature([Ad, User])], // <--- Add User here
  controllers: [AdsController],
  providers: [AdsService],
  exports: [AdsService],
})
export class AdsModule {}