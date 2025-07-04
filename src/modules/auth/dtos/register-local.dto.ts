import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterLocalDto {
  @IsEmail()
  @Length(1, 255)
  email: string;

  @IsString()
  @Length(6, 100)
  password: string;
}
