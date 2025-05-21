import { Expose } from 'class-transformer';

export class PaymentMethodResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  issuer?: string;

  @Expose()
  statementClosingDay: number;

  @Expose()
  dueDay: number;
}
