import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(Message) private messagesRepository: Repository<Message>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  @SubscribeMessage('joinTrade')
  async handleJoinTrade(@MessageBody() data: { tradeId: number }, @ConnectedSocket() client: Socket) {
    client.join(`trade-${data.tradeId}`);
    
    const messages = await this.messagesRepository.find({
      where: { tradeId: data.tradeId },
      relations: ['sender'],
      order: { createdAt: 'ASC' }
    });
    
    client.emit('previousMessages', messages);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: { tradeId: number, senderId: number, content: string, type?: 'TEXT' | 'IMAGE', imageUrl?: string }) {
    const sender = await this.usersRepository.findOneBy({ id: data.senderId });
    if (!sender) return;

    // Fix: Explicitly handle undefined/null for strict mode
    const finalImageUrl = data.imageUrl ? data.imageUrl : undefined;

    const message = this.messagesRepository.create({
      tradeId: data.tradeId,
      sender: sender,
      content: data.content,
      type: data.type || 'TEXT',
      imageUrl: finalImageUrl // Assign strictly
    });

    const savedMessage = await this.messagesRepository.save(message);
    this.server.to(`trade-${data.tradeId}`).emit('newMessage', savedMessage);
  }
}