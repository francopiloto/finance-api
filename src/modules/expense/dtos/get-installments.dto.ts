import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

import { InstallmentStatus } from '../expense.constants';

export class GetInstallmentsDto {
  @IsOptional()
  @IsUUID()
  expenseId?: string;

  @IsOptional()
  @IsEnum(InstallmentStatus)
  status?: InstallmentStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  billingMonth?: Date;

  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paidAtFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paidAtTo?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paidAt?: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  pageSize?: number;
}
