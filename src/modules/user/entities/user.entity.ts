import { ApiHideProperty } from '@nestjs/swagger';

import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

import { PrimaryUuidColumn } from '@decorators/primary-uuid-column.decorator';

@Entity()
export class User {
  @PrimaryUuidColumn()
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ select: false })
  @ApiHideProperty()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
