import { IsOptional, IsString, Length } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsOptional()
  @IsString()
  @Length(5, 255)
  description?: string;
}
