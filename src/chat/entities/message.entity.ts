import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Trade } from '../../trades/entities/trade.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  // Link message to a specific Trade (Order ID)
  @ManyToOne(() => Trade, (trade) => trade.id)
  trade: Trade;

  // Link message to the User who sent it
  @ManyToOne(() => User, (user) => user.id)
  sender: User;

  @CreateDateColumn()
  createdAt: Date;
}