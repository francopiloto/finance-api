import { IsEmail, IsString, Length } from 'class-validator';

export class SignUpUserDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsEmail()
  @Length(1, 255)
  email: string;

  @IsString()
  @Length(6, 100)
  password: string;
}
