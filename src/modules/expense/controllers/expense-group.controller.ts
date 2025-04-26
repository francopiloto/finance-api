import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ApiDefaultAuth } from '@decorators/api-default-auth.decorator';
import { CurrentUser } from '@modules/auth/decorators/user.decorator';
import { User } from '@modules/user/entities/user.entity';

import { CreateExpenseGroupDto } from '../dtos/create-expense-group.dto';
import { UpdateExpenseGroupDto } from '../dtos/update-expense-group.dto';
import { ExpenseGroupService } from '../services/expense-group.service';

@Controller('expense-group')
@ApiTags('Expense Group')
@ApiDefaultAuth()
export class ExpenseGroupController {
  constructor(private readonly service: ExpenseGroupService) {}

  @Get()
  @ApiOperation({ summary: 'List all global and user-customized expense groups' })
  @ApiOkResponse({ description: 'List of expense groups retrieved successfully.' })
  findAll(@CurrentUser() user: User) {
    return this.service.findAll(user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user-customized expense group' })
  @ApiCreatedResponse({ description: 'Expense group created successfully.' })
  create(@CurrentUser() user: User, @Body() data: CreateExpenseGroupDto) {
    return this.service.create(user, data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user-customized expense group' })
  @ApiOkResponse({ description: 'Expense group updated successfully.' })
  @ApiNotFoundResponse({ description: 'Expense group not found.' })
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() data: UpdateExpenseGroupDto) {
    return this.service.update(user, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user-customized expense group' })
  @ApiOkResponse({ description: 'Expense group deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Expense group not found.' })
  @ApiConflictResponse({ description: 'Cannot delete expense group with associated expenses.' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.remove(user, id);
  }
}
