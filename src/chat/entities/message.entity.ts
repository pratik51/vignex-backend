import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  // --- FIX: Add { nullable: true } ---
  // This prevents the startup crash if old messages have no content
  // and allows for "Image-only" messages in the future.
  @Column({ nullable: true }) 
  content: string;

  @Column({ default: 'TEXT' })
  type: 'TEXT' | 'IMAGE';

  @Column({ type: 'text', nullable: true }) 
  imageUrl: string; 

  @Column()
  tradeId: number;

  @ManyToOne(() => User)
  sender: User;

  @CreateDateColumn()
  createdAt: Date;
}