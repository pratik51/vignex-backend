import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Ad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  seller: User;

  // --- STEP 1: TYPE & PRICE ---
  @Column({ default: 'SELL' })
  type: 'BUY' | 'SELL';

  @Column({ default: 'FIXED' })
  priceType: 'FIXED' | 'FLOATING';

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number; 

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  floatingMargin: number; 

  // --- STEP 2: AMOUNT & LIMITS ---
  @Column({ type: 'decimal', precision: 18, scale: 8 })
  initialAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  currentAmount: number; 

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  minLimit: number; 

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  maxLimit: number; 

  // --- FIX IS HERE: Added { default: 'UPI' } ---
  @Column({ default: 'UPI' }) 
  paymentMethod: string; 

  @Column({ default: 15 })
  paymentTimeLimit: number; 

  // --- STEP 3: REMARKS & AUTOMATION ---
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