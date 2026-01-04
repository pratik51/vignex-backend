import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AdsModule } from './ads/ads.module';
import { TradesModule } from './trades/trades.module';
import { ChatModule } from './chat/chat.module';
import { User } from './users/entities/user.entity';
import { Ad } from './ads/entities/ad.entity';
import { Trade } from './trades/entities/trade.entity';
import { Message } from './chat/entities/message.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // 1. If Render provides a simplified URL, use it directly:
      url: process.env.DATABASE_URL, 
      
      // 2. Otherwise fall back to individual vars (for local dev):
      host: process.env.DB_HOST,
      port: 5432,
      password: process.env.DB_PASSWORD,
      username: process.env.DB_USER,
      database: process.env.DB_NAME,
      
      entities: [User, Ad, Trade, Message],
      synchronize: true,
      
      // 3. SSL is required for Render Production
      ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false },
      
      // 4. Extra safety to prevent empty connection errors
      autoLoadEntities: true,
    }),
    UsersModule,
    AdsModule,
    TradesModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}