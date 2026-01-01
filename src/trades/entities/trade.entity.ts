import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

// This defines the "Deal" between two people
@Entity()
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number; // How much USDT?

  @Column({ default: 'PENDING' })
  status: string; // PENDING, PAID, COMPLETED, DISPUTED, CANCELLED

  // Link to the Seller (User)
  @ManyToOne(() => User, (user) => user.id)
  seller: User;

  // Link to the Buyer (User)
  @ManyToOne(() => User, (user) => user.id)
  buyer: User;

  @CreateDateColumn()
  createdAt: Date;
}