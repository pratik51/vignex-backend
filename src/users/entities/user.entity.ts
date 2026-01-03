import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isKycVerified: boolean;

  @Column({ default: false })
  isFrozen: boolean;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  usdtBalance: number;

  @Column({ nullable: true })
  depositAddress: string;

  // --- REPUTATION STATS ---
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionRate: number; 

  // CHANGED: Store Seconds instead of Minutes
  @Column({ type: 'decimal', precision: 10, scale: 0, default: 0 })
  avgReleaseTimeSeconds: number; 
  // ------------------------

  @Column({ default: 0 })
  totalTrades: number;

  @Column({ default: 'Bronze' })
  tier: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}