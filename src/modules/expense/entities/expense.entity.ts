import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';

import { ExpensePriority } from '../expense.constants';
import { ExpenseGroup } from './expense-group.entity';
import { Installment } from './installment.entity';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ExpenseGroup, { nullable: false, onDelete: 'RESTRICT' })
  group: ExpenseGroup;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'timestamptz' })
  date: Date;

  @Column({ type: 'enum', enum: ExpensePriority })
  priority: ExpensePriority;

  @Column({ nullable: true, length: 255 })
  description?: string;

  @Column({ nullable: true, length: 255 })
  beneficiary?: string;

  @OneToMany(() => Installment, (installment) => installment.expense, { cascade: true })
  installments: Installment[];
}
