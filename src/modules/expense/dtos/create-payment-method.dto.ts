import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString()
  @Length(2, 255)
  name: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  issuer?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  statementClosingDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;
}
