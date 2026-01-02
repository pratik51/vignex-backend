import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ad } from '../../ads/entities/ad.entity'; // Ensure you created the Ad entity from previous steps

// --- THE 6-STATE MACHINE ---
export enum TradeStatus {
  CREATED = 'CREATED',                   // 1. Initial State (Funds Locked)
  PENDING_PAYMENT = 'PENDING_PAYMENT',   // 2. Timer Running
  PAID = 'PAID',                         // 3. Buyer clicked "Transferred"
  COMPLETED = 'COMPLETED',               // 4. Seller clicked "Release"
  CANCELLED = 'CANCELLED',               // 5. Timer expired or User cancelled
  IN_APPEAL = 'IN_APPEAL'                // 6. Dispute raised
}

@Entity()
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number; // USDT Amount

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Locked Price (e.g., 90.50 INR)

  @Column({
    type: 'simple-enum',
    enum: TradeStatus,
    default: TradeStatus.PENDING_PAYMENT // Starts here immediately upon creation
  })
  status: TradeStatus;

  @ManyToOne(() => User, (user) => user.id)
  seller: User;

  @ManyToOne(() => User, (user) => user.id)
  buyer: User;

  @ManyToOne(() => Ad, (ad) => ad.id)
  ad: Ad;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date; // Important for calculating timeouts
}