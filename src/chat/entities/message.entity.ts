import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  // --- NEW: Image Support ---
  @Column({ default: 'TEXT' })
  type: 'TEXT' | 'IMAGE';

  @Column({ type: 'text', nullable: true }) // Using 'text' type to allow long Base64 strings
  imageUrl: string; 

  @Column()
  tradeId: number;

  @ManyToOne(() => User)
  sender: User;

  @CreateDateColumn()
  createdAt: Date;
}