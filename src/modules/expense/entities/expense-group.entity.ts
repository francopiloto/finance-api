import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { PrimaryUuidColumn } from '@decorators/primary-uuid-column.decorator';
import { User } from '@modules/user/entities/user.entity';

@Entity()
@Unique(['createdBy', 'name'])
export class ExpenseGroup {
  @PrimaryUuidColumn()
  id: string;

  @Column({ length: 255 })
  name: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdBy: User | null;
}
