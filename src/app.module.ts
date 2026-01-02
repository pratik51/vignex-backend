import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // <--- Now this will work
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TradesModule } from './trades/trades.module';
import { User } from './users/entities/user.entity';
import { Trade } from './trades/entities/trade.entity';
import { AdsModule } from './ads/ads.module';

@Module({
  imports: [
    // 1. Initialize the Config Module so we can read .env files
    ConfigModule.forRoot({
      isGlobal: true, // Makes it available everywhere
    }),

    // 2. Connect to Database (Render or Local)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      // FIX: Handle "undefined" port safely
      port: parseInt(process.env.DB_PORT || '5432'), 
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'VigNex2025',
      database: process.env.DB_NAME || 'vignex',
      entities: [User, Trade],
      synchronize: true, // auto-create tables (turn off in production later)
      ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false, // Required for Render
    }),
    UsersModule,
    TradesModule,
    AdsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}