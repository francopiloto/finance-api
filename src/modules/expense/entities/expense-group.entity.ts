import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';

@Entity()
@Unique(['createdBy', 'name'])
export class ExpenseGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdBy: User | null;
}
