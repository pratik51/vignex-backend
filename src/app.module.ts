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
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        // --- DEBUG LOGGING (Check your Render Logs) ---
        console.log('Connecting to DB...');
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_USER:', process.env.DB_USER || process.env.DB_USERNAME); // Log which one exists
        
        return {
          type: 'postgres',
          // 1. Priority: Use the Full Render URL if available
          url: process.env.DATABASE_URL,
          
          // 2. Fallback: Build connection manually
          host: process.env.DB_HOST,
          port: 5432,
          // FIX: Look for DB_USER, if missing, look for DB_USERNAME
          username: process.env.DB_USER || process.env.DB_USERNAME, 
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          
          entities: [User, Ad, Trade, Message],
          synchronize: true,
          ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false },
        };
      },
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