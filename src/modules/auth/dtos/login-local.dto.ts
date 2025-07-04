import { IsOptional, IsString, Length } from 'class-validator';

import { RegisterLocalDto } from './register-local.dto';

export class LoginLocalDto extends RegisterLocalDto {
  @IsOptional()
  @IsString()
  @Length(3, 100)
  device?: string;
}
