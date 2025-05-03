import { Body, Controller, Delete, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ApiDefaultAuth } from '@decorators/api-default-auth.decorator';
import { CheckOwnership, CurrentUser } from '@modules/auth/decorators';
import { User } from '@modules/user/entities/user.entity';

import { CreateExpenseDto } from '../dtos/create-expense.dto';
import { UpdateExpenseDto } from '../dtos/update-expense.dto';
import { Expense } from '../entities/expense.entity';
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
  @CheckOwnership(Expense)
  @ApiOperation({ summary: 'Update an expense header' })
  @ApiOkResponse({ description: 'Expense updated successfully.' })
  @ApiNotFoundResponse({ description: 'Expense not found.' })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateExpenseDto,
  ) {
    return this.service.update(user, id, data);
  }

  @Delete(':id')
  @CheckOwnership(Expense)
  @ApiOperation({ summary: 'Delete an expense if all installments are still pending' })
  @ApiOkResponse({ description: 'Expense deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Expense not found.' })
  @ApiConflictResponse({
    description: 'Cannot delete expense with associated non pending installments.',
  })
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(user, id);
  }
}
