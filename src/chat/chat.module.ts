import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { Message } from './entities/message.entity';
import { Trade } from '../trades/entities/trade.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Trade, User])],
  providers: [ChatGateway],
})
export class ChatModule {}