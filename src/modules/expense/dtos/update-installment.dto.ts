import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateInstallmentDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  billingMonth?: Date;

  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;
}
