import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ApiDefaultAuth } from '@decorators/api-default-auth.decorator';
import { CheckOwnership, CurrentUser } from '@modules/auth/decorators';
import { User } from '@modules/user/entities/user.entity';

import { CreatePaymentMethodDto } from '../dtos/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dtos/update-payment-method.dto';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentMethodService } from '../services/payment-method.service';

@Controller('payment-method')
@ApiTags('Payment Method')
@ApiDefaultAuth()
export class PaymentMethodController {
  constructor(private readonly service: PaymentMethodService) {}

  @Get()
  @ApiOperation({ summary: 'List all user-customized payment methods' })
  @ApiOkResponse({ description: 'List of payment methods retrieved successfully.' })
  findAll(@CurrentUser() user: User) {
    return this.service.findAll(user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user-customized payment method' })
  @ApiCreatedResponse({ description: 'Payment method created successfully.' })
  create(@CurrentUser() user: User, @Body() data: CreatePaymentMethodDto) {
    return this.service.create(user, data);
  }

  @Patch(':id')
  @CheckOwnership(PaymentMethod)
  @ApiOperation({ summary: 'Update a user-customized payment method' })
  @ApiOkResponse({ description: 'Payment method updated successfully.' })
  @ApiNotFoundResponse({ description: 'Payment method not found.' })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdatePaymentMethodDto,
  ) {
    return this.service.update(user, id, data);
  }

  @Delete(':id')
  @CheckOwnership(PaymentMethod)
  @ApiOperation({ summary: 'Delete a user-customized payment method that has not yet been used.' })
  @ApiOkResponse({ description: 'Payment method deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Payment method not found.' })
  @ApiConflictResponse({
    description: 'Cannot delete payment method with associated installments.',
  })
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(user, id);
  }
}
