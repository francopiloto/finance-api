import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { endOfMonth, startOfMonth } from 'date-fns';
import { Repository } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';
import { fk } from '@utils/db';

import { CreateInstallmentDto } from '../dtos/create-installment.dto';
import { GetInstallmentsDto } from '../dtos/get-installments.dto';
import { UpdateInstallmentStatusDto } from '../dtos/update-installment-status.dto';
import { UpdateInstallmentDto } from '../dtos/update-installment.dto';
import { Expense } from '../entities/expense.entity';
import { Installment } from '../entities/installment.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { InstallmentStatus } from '../expense.constants';

@Injectable()
export class InstallmentService {
  constructor(
    @InjectRepository(Installment)
    private readonly installmentRepo: Repository<Installment>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(PaymentMethod)
    private readonly paymentRepo: Repository<PaymentMethod>,
  ) {}

  findMany(user: User, filters: GetInstallmentsDto) {
    const {
      expenseId,
      status,
      billingMonth,
      paymentMethodId,
      paidAtFrom,
      paidAtTo,
      paidAt,
      page,
      pageSize,
    } = filters;

    const qb = this.installmentRepo
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.expense', 'expense')
      .leftJoinAndSelect('expense.group', 'group')
      .leftJoinAndSelect('installment.paymentMethod', 'paymentMethod')
      .select([
        'installment.id',
        'installment.status',
        'installment.value',
        'installment.billingMonth',
        'installment.paidAt',
        'expense.id',
        'expense.date',
        'expense.priority',
        'expense.description',
        'expense.beneficiary',
        'group.id',
        'group.name',
        'paymentMethod.id',
        'paymentMethod.name',
        'paymentMethod.issuer',
        'paymentMethod.statementClosingDay',
        'paymentMethod.dueDay',
      ])
      .where('installment.user_id = :userId', { userId: user.id });

    if (expenseId) {
      qb.andWhere('expense.id = :expenseId', { expenseId });
    }

    if (status) {
      qb.andWhere('installment.status = :status', { status });
    }

    if (billingMonth) {
      const start = startOfMonth(billingMonth);
      const end = endOfMonth(billingMonth);
      qb.andWhere('installment.billing_month BETWEEN :start AND :end', { start, end });
    }

    if (paymentMethodId) {
      qb.andWhere('paymentMethod.id = :paymentMethodId', { paymentMethodId });
    }

    if (paidAt) {
      qb.andWhere('DATE(installment.paid_at) = DATE(:paidAt)', { paidAt });
    } else if (paidAtFrom) {
      qb.andWhere('installment.paid_at >= :paidAtFrom', { paidAtFrom });
    } else if (paidAtTo) {
      qb.andWhere('installment.paid_at <= :paidAtTo', { paidAtTo });
    }

    if (page && pageSize) {
      qb.skip((page - 1) * pageSize).take(pageSize);
    }

    return qb.getManyAndCount();
  }

  async create(
    user: User,
    expenseId: string,
    { paymentMethodId, ...rest }: CreateInstallmentDto,
  ): Promise<Installment> {
    const expense = await this.expenseRepo.findOne({ where: { id: expenseId, user: fk(user) } });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const paymentMethod = await this.paymentRepo.findOne({
      where: { id: paymentMethodId, user: fk(user) },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    return this.installmentRepo.save(
      this.installmentRepo.create({
        expense,
        user,
        status: InstallmentStatus.PENDING,
        paymentMethod,
        ...rest,
      }),
    );
  }

  async update(
    user: User,
    id: string,
    { paymentMethodId, ...rest }: UpdateInstallmentDto,
  ): Promise<Installment> {
    const installment = await this.installmentRepo.findOne({
      where: { id, user: fk(user) },
      relations: ['paymentMethod'],
    });

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    if (installment.status === InstallmentStatus.PAID) {
      throw new ConflictException('Cannot edit a paid installment');
    }

    if (installment.status === InstallmentStatus.SCHEDULED) {
      throw new ConflictException(
        'Cannot edit a scheduled installment, only status change is allowed',
      );
    }

    if (paymentMethodId && paymentMethodId !== installment.paymentMethod.id) {
      const paymentMethod = await this.paymentRepo.findOne({
        where: { id: paymentMethodId, user: fk(user) },
      });

      if (!paymentMethod) {
        throw new NotFoundException('Payment method not found');
      }

      installment.paymentMethod = paymentMethod;
    }

    Object.assign(installment, rest);
    return this.installmentRepo.save(installment);
  }

  async remove(user: User, id: string): Promise<Installment> {
    const installment = await this.installmentRepo.findOne({ where: { id, user: fk(user) } });

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    if (installment.status !== InstallmentStatus.PENDING) {
      throw new ConflictException('Cannot remove installment that is not pending');
    }

    return await this.installmentRepo.remove(installment);
  }

  async updateStatus(
    user: User,
    id: string,
    { status }: UpdateInstallmentStatusDto,
  ): Promise<Installment> {
    const installment = await this.installmentRepo.findOne({ where: { id, user: fk(user) } });

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    if (installment.status === InstallmentStatus.PAID) {
      throw new ConflictException('Cannot change status of a paid installment');
    }

    if (installment.status === InstallmentStatus.PENDING) {
      if (![InstallmentStatus.SCHEDULED, InstallmentStatus.PAID].includes(status)) {
        throw new ConflictException('Invalid status transition from pending');
      }
    } else if (installment.status === InstallmentStatus.SCHEDULED) {
      if (status !== InstallmentStatus.PAID) {
        throw new ConflictException('Invalid status transition from scheduled');
      }
    }

    installment.status = status;
    return this.installmentRepo.save(installment);
  }
}
