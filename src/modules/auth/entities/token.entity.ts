import { Column, CreateDateColumn, Entity, ManyToOne, Unique, UpdateDateColumn } from 'typeorm';

import { PrimaryUuidColumn } from '@decorators/primary-uuid-column.decorator';

import { AuthAccount } from './auth-account.entity';

@Entity()
@Unique(['user', 'device'])
export class AuthToken {
  @PrimaryUuidColumn()
  id: string;

  @ManyToOne(() => AuthAccount, { nullable: false, onDelete: 'CASCADE' })
  account: AuthAccount;

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
