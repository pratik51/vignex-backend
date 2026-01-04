import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ad } from '../../ads/entities/ad.entity';

export enum TradeStatus {
  WAITING_VERIFICATION = 'WAITING_VERIFICATION',
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

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  price: number;

  @Column({ default: TradeStatus.WAITING_VERIFICATION })
  status: string;

  // --- NEW TIMERS ---
  @Column({ nullable: true })
  verificationExpiresAt: Date; // Auto-cancel if merchant sleeps

  @Column({ nullable: true })
  paymentExpiresAt: Date; // Auto-cancel if buyer sleeps

  @ManyToOne(() => User, (user) => user.trades)
  buyer: User;

  @ManyToOne(() => User, (user) => user.trades)
  seller: User;

  @ManyToOne(() => Ad)
  ad: Ad;

  @Column({ nullable: true })
  paymentMethod: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  paymentConfirmedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}