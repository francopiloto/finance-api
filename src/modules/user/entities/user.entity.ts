import { Column, CreateDateColumn, Entity, Index, UpdateDateColumn } from 'typeorm';

import { PrimaryUuidColumn } from '@decorators/primary-uuid-column.decorator';

import { OnboardingStep } from '../enums/onboarding-step.enum';

@Entity()
export class User {
  @PrimaryUuidColumn()
  id: string;

  @Column({ length: 255 })
  name: string;

  @Index()
  @Column({ unique: true, length: 255 })
  email: string;

  @Column({
    type: 'enum',
    enum: OnboardingStep,
    default: OnboardingStep.FINISH,
  })
  onboardingStep: OnboardingStep;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
