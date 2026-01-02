import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

// 1. DEFINE THE DROPDOWN OPTIONS
export enum PaymentMethod {
  IMPS = 'IMPS',
  UPI = 'UPI',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  DIGITAL_RUPEE = 'Digital Rupee'
}

@Entity()
export class Ad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  seller: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; 

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  initialAmount: number; 

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  currentAmount: number; 

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  minLimit: number; 

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  maxLimit: number; 

  // 2. USE THE ENUM HERE
  @Column({
    type: 'simple-enum',
    enum: PaymentMethod,
    default: PaymentMethod.UPI // Default option
  })
  paymentMethod: PaymentMethod;

  @Column({ default: 'OPEN' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}