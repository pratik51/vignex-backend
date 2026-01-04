import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Ad } from '../../ads/entities/ad.entity';
import { Trade } from '../../trades/entities/trade.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  // Wallet Balance (USDT)
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  usdtBalance: number;

  // Merchant Stats
  @Column({ default: 'Bronze' })
  tier: string; 

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionRate: number;

  @Column({ default: 0 })
  avgReleaseTimeSeconds: number;

  @Column({ default: false })
  isKycVerified: boolean;

  // --- NEW: Admin Flag ---
  @Column({ default: false })
  isAdmin: boolean;

  // Relations
  @OneToMany(() => Ad, (ad) => ad.seller)
  ads: Ad[];

  @OneToMany(() => Trade, (trade) => trade.buyer)
  trades: Trade[]; // Trades where I am the buyer (or taker)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}