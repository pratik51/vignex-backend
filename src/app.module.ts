import { User } from './users/entities/user.entity'; // <--- Add this import at the top!
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TradesModule } from './trades/trades.module';
import { Trade } from './trades/entities/trade.entity'; // <--- Import this!

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'VigNex2025', // Keep your password!
      database: 'vignex',
      entities: [User, Trade], // <--- Add Trade here!
      synchronize: true,
    }),
    UsersModule,
    TradesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}