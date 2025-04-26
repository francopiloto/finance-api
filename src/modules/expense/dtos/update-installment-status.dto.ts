import { IsEnum } from 'class-validator';

import { InstallmentStatus } from '../expense.constants';

export class UpdateInstallmentStatusDto {
  @IsEnum(InstallmentStatus)
  status: InstallmentStatus;
}
