import { IsString, Length } from 'class-validator';

export class CreateExpenseGroupDto {
  @IsString()
  @Length(2, 255)
  name: string;
}
