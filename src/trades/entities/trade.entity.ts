import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ad } from '../../ads/entities/ad.entity';

export enum TradeStatus {
  CREATED = 'CREATED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  IN_APPEAL = 'IN_APPEAL'
}

@Entity()
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({
    type: 'simple-enum',
    enum: TradeStatus,
    default: TradeStatus.PENDING_PAYMENT
  })
  status: TradeStatus;

  // --- NEW TIMESTAMPS ---
  @Column({ nullable: true })
  paymentConfirmedAt: Date; // Time Buyer clicked "Paid"

  @Column({ nullable: true })
  completedAt: Date; // Time Seller clicked "Release"
  // ----------------------

  @ManyToOne(() => User, (user) => user.id)
  seller: User;

  @ManyToOne(() => User, (user) => user.id)
  buyer: User;

  @ManyToOne(() => Ad, (ad) => ad.id)
  ad: Ad;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}