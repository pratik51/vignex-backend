import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Ad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  seller: User; // The person selling USDT

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // e.g. 89.50 INR

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  initialAmount: number; // e.g. 100 USDT

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  currentAmount: number; // What is left to be sold

  @Column()
  paymentMethod: string; // "UPI", "IMPS", "Bank Transfer"

  @Column({ default: 'OPEN' })
  status: string; // OPEN (Visible), CLOSED (Empty/Hidden)

  @CreateDateColumn()
  createdAt: Date;
}