import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addMonths } from 'date-fns';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';

import { CreateExpenseDto } from '../dtos/create-expense.dto';
import { UpdateExpenseDto } from '../dtos/update-expense.dto';
import { ExpenseGroup } from '../entities/expense-group.entity';
import { Expense } from '../entities/expense.entity';
import { Installment } from '../entities/installment.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { InstallmentStatus } from '../expense.constants';

@Injectable()
export class ExpenseService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(ExpenseGroup)
    private readonly groupRepo: Repository<ExpenseGroup>,
  ) {}

  async findGroup(user: User, groupId: string, manager?: EntityManager): Promise<ExpenseGroup> {
    const repo = manager ? manager.getRepository(ExpenseGroup) : this.groupRepo;

    const group =
      user && groupId
        ? await repo
            .createQueryBuilder('group')
            .where('group.id = :groupId', { groupId })
            .andWhere('group.created_by = :userId OR group.created_by IS NULL', { userId: user.id })
            .getOne()
        : null;

    if (!group) {
      throw new NotFoundException('Expense group not found');
    }

    return group;
  }

  async create(
    user: User,
    { groupId, value, numInstallments, paymentMethodId, ...rest }: CreateExpenseDto,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const group = await this.findGroup(user, groupId, manager);
      const paymentMethod = await manager.findOne(PaymentMethod, {
        where: { user, id: paymentMethodId },
      });

      if (!paymentMethod) {
        throw new NotFoundException('Payment method not found');
      }

      const expense = await manager.save(manager.create(Expense, { user, group, ...rest }));
      const installmentValue = +(value / numInstallments).toFixed(2);

      const installments = Array.from({ length: numInstallments }, (_, index) =>
        manager.create(Installment, {
          expense,
          user,
          status: InstallmentStatus.PENDING,
          value: installmentValue,
          billingMonth: addMonths(rest.date, index),
          paymentMethod,
        }),
      );

      await manager.save(Installment, installments);

      return manager.findOne(Expense, {
        where: { id: expense.id },
        relations: ['group', 'installments'],
      });
    });
  }

  async remove(user: User, id: string) {
    return this.dataSource.transaction(async (manager) => {
      const expense =
        user && id
          ? await manager.findOne(Expense, {
              where: { user, id },
              relations: ['installments'],
            })
          : null;

      if (!expense) {
        throw new NotFoundException('Expense not found');
      }

      if (expense.installments.some(({ status }) => status !== InstallmentStatus.PENDING)) {
        throw new ConflictException(
          'Cannot delete expense with associated non pending installments',
        );
      }

      return manager.remove(Expense, expense);
    });
  }

  async update(user: User, id: string, { groupId, ...rest }: UpdateExpenseDto) {
    const expense = user && id ? await this.expenseRepo.findOne({ where: { user, id } }) : null;

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const group = groupId ? { group: await this.findGroup(user, groupId) } : undefined;

    Object.assign(expense, rest, group);
    return this.expenseRepo.save(expense);
  }
}
