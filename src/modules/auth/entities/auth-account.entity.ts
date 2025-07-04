import { ApiHideProperty } from '@nestjs/swagger';

import { Column, CreateDateColumn, Entity, Index, ManyToOne, UpdateDateColumn } from 'typeorm';

import { PrimaryUuidColumn } from '@decorators/primary-uuid-column.decorator';

import { User } from '../../user/entities/user.entity';
import { AuthProvider } from '../auth.enums';

@Entity()
@Index(['provider', 'providerUserId'], { unique: true })
@Index(['provider', 'email'], { unique: true, where: 'email IS NOT NULL' })
export class AuthAccount {
  @PrimaryUuidColumn()
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  user: User;

  @Column({ type: 'enum', enum: AuthProvider })
  provider: AuthProvider;

  @Column({ nullable: true })
  providerUserId?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true, select: false })
  @ApiHideProperty()
  password?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
