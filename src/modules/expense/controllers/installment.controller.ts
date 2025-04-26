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

import { CreateInstallmentDto } from '../dtos/create-installment.dto';
import { UpdateInstallmentStatusDto } from '../dtos/update-installment-status.dto';
import { UpdateInstallmentDto } from '../dtos/update-installment.dto';
import { InstallmentService } from '../services/installment.service';

@Controller('installment')
@ApiDefaultAuth()
export class InstallmentController {
  constructor(private readonly service: InstallmentService) {}

  @Post(':expenseId')
  @ApiOperation({ summary: 'Add a new installment to an expense' })
  @ApiCreatedResponse({ description: 'Installment created successfully.' })
  @ApiNotFoundResponse({ description: 'Expense or payment method not found.' })
  async create(
    @CurrentUser() user: User,
    @Param('expenseId') expenseId: string,
    @Body() data: CreateInstallmentDto,
  ) {
    return this.service.create(user, expenseId, data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an installment' })
  @ApiOkResponse({ description: 'Installment updated successfully.' })
  @ApiNotFoundResponse({ description: 'Installment not found.' })
  @ApiConflictResponse({ description: 'Cannot edit a paid or scheduled installment.' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() data: UpdateInstallmentDto,
  ) {
    return this.service.update(user, id, data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update only the status of an installment' })
  @ApiOkResponse({ description: 'Installment status updated successfully.' })
  @ApiNotFoundResponse({ description: 'Installment not found.' })
  @ApiConflictResponse({ description: 'Invalid status transition or installment already paid.' })
  async updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() data: UpdateInstallmentStatusDto,
  ) {
    return this.service.updateStatus(user, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pending installment' })
  @ApiOkResponse({ description: 'Installment removed successfully.' })
  @ApiNotFoundResponse({ description: 'Installment not found.' })
  @ApiConflictResponse({ description: 'Cannot remove installment that is not pending.' })
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.remove(user, id);
  }
}
