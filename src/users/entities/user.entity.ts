import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // We will encrypt this later!

  @Column({ default: false })
  isKycVerified: boolean; // This is your Compliance Check

  @Column({ default: false })
  isFrozen: boolean; // The "Zero-Freeze" kill switch

  // Balances (Simulating a Multi-Currency Wallet)
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  usdtBalance: number;

  @Column({ nullable: true })
  depositAddress: string; // The unique crypto address we give them

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}