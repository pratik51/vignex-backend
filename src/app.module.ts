import { User } from './users/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TradesModule } from './trades/trades.module';
import { Trade } from './trades/entities/trade.entity';
import { ConfigModule } from '@nestjs/config'; // Make sure this is installed, if not, standard process.env works too.

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      // FIX: Check for Environment Variables first!
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'VigNex2025',
      database: process.env.DB_NAME || 'vignex',
      entities: [User, Trade],
      synchronize: true,
      // FIX: Render's database requires SSL (Secure connection)
      ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
    }),
    UsersModule,
    TradesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}