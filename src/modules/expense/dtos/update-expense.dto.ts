import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

import { ExpensePriority } from '../expense.constants';

export class UpdateExpenseDto {
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @IsOptional()
  @IsEnum(ExpensePriority)
  priority?: ExpensePriority;

  @IsOptional()
  @IsString()
  @Length(5, 255)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  beneficiary?: string;
}
