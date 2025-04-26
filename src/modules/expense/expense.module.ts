import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExpenseGroupController } from './controllers/expense-group.controller';
import { ExpenseController } from './controllers/expense.controller';
import { InstallmentController } from './controllers/installment.controller';
import { PaymentMethodController } from './controllers/payment-method.controller';
import { ExpenseGroup } from './entities/expense-group.entity';
import { Expense } from './entities/expense.entity';
import { Installment } from './entities/installment.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { ExpenseGroupService } from './services/expense-group.service';
import { ExpenseService } from './services/expense.service';
import { InstallmentService } from './services/installment.service';
import { PaymentMethodService } from './services/payment-method.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, ExpenseGroup, Installment, PaymentMethod])],
  providers: [ExpenseGroupService, ExpenseService, InstallmentService, PaymentMethodService],
  controllers: [
    ExpenseController,
    ExpenseGroupController,
    InstallmentController,
    PaymentMethodController,
  ],
})
export class ExpenseModule {}
