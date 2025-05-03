import { Column, CreateDateColumn, Entity, ManyToOne, Unique, UpdateDateColumn } from 'typeorm';

import { PrimaryUuidColumn } from '@decorators/primary-uuid-column.decorator';
import { User } from '@modules/user/entities/user.entity';

@Entity()
@Unique(['user', 'device'])
export class AuthToken {
  @PrimaryUuidColumn()
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column({ length: 100 })
  device: string;

  @Column({ select: false, length: 512 })
  refreshTokenHash: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
