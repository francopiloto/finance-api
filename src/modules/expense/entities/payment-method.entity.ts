import { Column, Entity, ManyToOne } from 'typeorm';

import { PrimaryUuidColumn } from '@decorators/primary-uuid-column.decorator';
import { User } from '@modules/user/entities/user.entity';

@Entity()
export class PaymentMethod {
  @PrimaryUuidColumn()
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  issuer?: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'smallint', default: 0 })
  statementClosingDay: number;

  @Column({ type: 'smallint', default: 0 })
  dueDay: number;
}
