import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TradesModule } from './trades/trades.module';
import { AdsModule } from './ads/ads.module';
import { User } from './users/entities/user.entity';
import { Trade } from './trades/entities/trade.entity';
import { Ad } from './ads/entities/ad.entity'; // <--- Import this!

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
      
      // FIX 1: Add Ad to the list OR use autoLoadEntities
      entities: [User, Trade, Ad], 
      autoLoadEntities: true, // <--- Best Practice: Loads entities from imported modules automatically

      synchronize: true,
      ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
    }),
    UsersModule,
    TradesModule,
    AdsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}