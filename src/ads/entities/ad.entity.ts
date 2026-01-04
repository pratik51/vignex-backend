import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Ad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  seller: User;

  @Column({ default: 'SELL' })
  type: 'BUY' | 'SELL';

  @Column({ default: 'FIXED' })
  priceType: 'FIXED' | 'FLOATING';

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number; 

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  floatingMargin: number; 

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  initialAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  currentAmount: number; 

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  minLimit: number; 

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  maxLimit: number; 

  @Column({ default: 'UPI' }) 
  paymentMethod: string; 

  // --- NEW: Time for Merchant to Verify Order (in minutes) ---
  @Column({ default: 10 })
  verificationTimeLimit: number; 

  // --- NEW: Time for User to Pay (after verification) ---
  @Column({ default: 15 })
  paymentTimeLimit: number; 

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'text', nullable: true })
  autoReply: string;

  @Column({ nullable: true })
  minRegisterDays: number;

  @Column({ default: 'OPEN' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}