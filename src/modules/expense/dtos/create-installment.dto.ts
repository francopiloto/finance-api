import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateInstallmentDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  value: number;

  @IsDate()
  @Type(() => Date)
  billingMonth: Date;

  @IsUUID()
  paymentMethodId: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paidAt?: Date;
}
