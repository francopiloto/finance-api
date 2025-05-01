import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsEmail()
  @Length(1, 255)
  email: string;

  @IsString()
  @Length(60, 60)
  password: string;
}
