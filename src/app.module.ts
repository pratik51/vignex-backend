import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TradesModule } from './trades/trades.module';
import { AdsModule } from './ads/ads.module';
import { ChatModule } from './chat/chat.module'; // <--- 1. Import Module
import { User } from './users/entities/user.entity';
import { Trade } from './trades/entities/trade.entity';
import { Ad } from './ads/entities/ad.entity';
import { Message } from './chat/entities/message.entity'; // <--- 2. Import Entity

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'VigNex2025',
      database: process.env.DB_NAME || 'vignex',
      
      // 3. Register the Message entity here
      entities: [User, Trade, Ad, Message], 
      autoLoadEntities: true, 

      synchronize: true,
      ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
    }),
    UsersModule,
    TradesModule,
    AdsModule,
    ChatModule, // <--- 4. Register the Module here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}