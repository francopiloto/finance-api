import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ApiDefaultAuth } from '@decorators/api-default-auth.decorator';
import { CurrentUser } from '@modules/auth/decorators/user.decorator';
import { User } from '@modules/user/entities/user.entity';

import { CreateExpenseDto } from '../dtos/create-expense.dto';
import { UpdateExpenseDto } from '../dtos/update-expense.dto';
import { ExpenseService } from '../services/expense.service';

@Controller('expense')
@ApiDefaultAuth()
export class ExpenseController {
  constructor(private readonly service: ExpenseService) {}

  @Post()
  @ApiOperation({ summary: "list the current user's expenses" })
  @ApiCreatedResponse({ description: 'Expense created successfully.' })
  create(@CurrentUser() user: User, @Body() data: CreateExpenseDto) {
    return this.service.create(user, data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense header' })
  @ApiOkResponse({ description: 'Expense updated successfully.' })
  @ApiNotFoundResponse({ description: 'Expense not found.' })
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() data: UpdateExpenseDto) {
    return this.service.update(user, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense if all installments are still pending' })
  @ApiOkResponse({ description: 'Expense deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Expense not found.' })
  @ApiConflictResponse({
    description: 'Cannot delete expense with associated non pending installments.',
  })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.remove(user, id);
  }
}
