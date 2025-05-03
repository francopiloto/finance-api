import { ApiHideProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';

@Entity()
@Unique(['user', 'name'])
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true, length: 255 })
  description?: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiHideProperty()
  user: User;
}
