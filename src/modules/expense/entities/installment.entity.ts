import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';

import { InstallmentStatus } from '../expense.constants';
import { Expense } from './expense.entity';
import { PaymentMethod } from './payment-method.entity';

@Entity()
export class Installment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Expense, { nullable: false, onDelete: 'CASCADE' })
  expense: Expense;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: InstallmentStatus, default: InstallmentStatus.PENDING })
  status: InstallmentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'date' })
  billingMonth: Date;

  @ManyToOne(() => PaymentMethod, { nullable: false, onDelete: 'RESTRICT' })
  paymentMethod: PaymentMethod;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt?: Date;
}
