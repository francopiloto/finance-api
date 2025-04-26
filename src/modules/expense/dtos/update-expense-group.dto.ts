import { PartialType } from '@nestjs/mapped-types';

import { CreateExpenseGroupDto } from './create-expense-group.dto';

export class UpdateExpenseGroupDto extends PartialType(CreateExpenseGroupDto) {}
