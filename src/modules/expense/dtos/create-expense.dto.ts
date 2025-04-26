import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

import { ExpensePriority } from '../expense.constants';

export class CreateExpenseDto {
  @IsUUID()
  groupId: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsEnum(ExpensePriority)
  priority: ExpensePriority;

  @IsOptional()
  @IsString()
  @Length(5, 255)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  beneficiary?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  value: number;

  @IsNumber()
  @Min(1)
  numInstallments: number;

  @IsUUID()
  paymentMethodId: string;
}
