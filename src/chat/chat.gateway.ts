import { 
  WebSocketGateway, SubscribeMessage, MessageBody, 
  ConnectedSocket, WebSocketServer 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Trade } from '../trades/entities/trade.entity';
import { User } from '../users/entities/user.entity';

@WebSocketGateway({ cors: { origin: '*' } }) // Allow all connections
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(Message) private messagesRepository: Repository<Message>,
    @InjectRepository(Trade) private tradesRepository: Repository<Trade>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  // 1. JOIN ROOM: User enters the trade chat
  @SubscribeMessage('joinTrade')
  handleJoinTrade(@MessageBody() tradeId: number, @ConnectedSocket() client: Socket) {
    client.join(`trade_${tradeId}`); // Create a unique room for this trade
    console.log(`Client ${client.id} joined trade_${tradeId}`);
    
    // Optional: Load previous messages and send them to the user
    this.loadMessages(tradeId, client);
  }

  // 2. SEND MESSAGE: User sends a text
  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() payload: { tradeId: number, senderId: number, text: string }) {
    const { tradeId, senderId, text } = payload;

    // A. Save to Database (History)
    const trade = await this.tradesRepository.findOneBy({ id: tradeId });
    const sender = await this.usersRepository.findOneBy({ id: senderId });

    if (trade && sender) {
      const msg = this.messagesRepository.create({ text, trade, sender });
      await this.messagesRepository.save(msg);

      // B. Broadcast to Room (Real-time)
      // We send the full object so frontend can display "User #1: Hello"
      this.server.to(`trade_${tradeId}`).emit('newMessage', {
        id: msg.id,
        text: msg.text,
        senderId: sender.id,
        createdAt: msg.createdAt
      });
    }
  }

  // Helper: Send history
  async loadMessages(tradeId: number, client: Socket) {
    const messages = await this.messagesRepository.find({
      where: { trade: { id: tradeId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' }
    });
    client.emit('loadHistory', messages);
  }
}