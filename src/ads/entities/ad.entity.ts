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
  price: number; // Final price

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  floatingMargin: number; // e.g. 105%

  // --- STEP 2: AMOUNT & LIMITS ---
  @Column({ type: 'decimal', precision: 18, scale: 8 })
  initialAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  currentAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  minLimit: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  maxLimit: number;

  @Column()
  paymentMethod: string; // e.g. "UPI,IMPS" (Comma separated)

  @Column({ default: 15 })
  paymentTimeLimit: number; // 15, 30, 45 mins

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