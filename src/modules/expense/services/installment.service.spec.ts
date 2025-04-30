import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';

import { InstallmentService } from './installment.service';
import { CreateInstallmentDto } from '../dtos/create-installment.dto';
import { UpdateInstallmentStatusDto } from '../dtos/update-installment-status.dto';
import { UpdateInstallmentDto } from '../dtos/update-installment.dto';
import { Expense } from '../entities/expense.entity';
import { Installment } from '../entities/installment.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { InstallmentStatus } from '../expense.constants';

const mockExpenseRepo = () => ({ findOne: jest.fn() });
const mockPaymentRepo = () => ({ findOne: jest.fn() });

const mockInstallmentRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('InstallmentService', () => {
  let service: InstallmentService;
  let expenseRepo: jest.Mocked<Repository<Expense>>;
  let paymentRepo: jest.Mocked<Repository<PaymentMethod>>;
  let installmentRepo: jest.Mocked<Repository<Installment>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstallmentService,
        { provide: getRepositoryToken(Expense), useFactory: mockExpenseRepo },
        { provide: getRepositoryToken(PaymentMethod), useFactory: mockPaymentRepo },
        { provide: getRepositoryToken(Installment), useFactory: mockInstallmentRepo },
      ],
    }).compile();

    service = module.get(InstallmentService);
    expenseRepo = module.get(getRepositoryToken(Expense));
    paymentRepo = module.get(getRepositoryToken(PaymentMethod));
    installmentRepo = module.get(getRepositoryToken(Installment));
  });

  describe('create', () => {
    it('should create an installment successfully', async () => {
      const user = { id: 'user-id' } as User;
      const expense = { id: 'expense-id', user } as Expense;
      const paymentMethod = { id: 'payment-id', user } as PaymentMethod;

      expenseRepo.findOne.mockResolvedValue(expense);
      paymentRepo.findOne.mockResolvedValue(paymentMethod);

      const dto: CreateInstallmentDto = {
        value: 100.0,
        billingMonth: new Date('2024-04-01'),
        paymentMethodId: paymentMethod.id,
      };

      const installment = {
        id: 'installment-id',
        expense,
        paymentMethod,
        value: dto.value,
      } as Installment;

      installmentRepo.create.mockReturnValue(installment);
      installmentRepo.save.mockResolvedValue(installment);

      const result = await service.create(user, expense.id, dto);

      expect(expenseRepo.findOne).toHaveBeenCalledWith({ where: { id: expense.id, user } });
      expect(paymentRepo.findOne).toHaveBeenCalledWith({ where: { id: paymentMethod.id, user } });

      expect(installmentRepo.create).toHaveBeenCalledWith({
        expense,
        user,
        status: InstallmentStatus.PENDING,
        paymentMethod,
        value: dto.value,
        billingMonth: dto.billingMonth,
      });

      expect(installmentRepo.save).toHaveBeenCalledWith(installment);
      expect(result).toEqual(installment);
    });

    it('should throw if expense not found on create', async () => {
      const user = { id: 'user-id' } as User;
      expenseRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create(user, 'nonexistent-expense-id', {
          value: 100,
          billingMonth: new Date(),
          paymentMethodId: 'pmid',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if payment method not found on create', async () => {
      const user = { id: 'user-id' } as User;
      const expense = { id: 'eid', user } as Expense;

      expenseRepo.findOne.mockResolvedValue(expense);
      paymentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create(user, 'eid', {
          value: 100,
          billingMonth: new Date(),
          paymentMethodId: 'missing',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an installment successfully', async () => {
      const user = { id: 'user-id' } as User;

      const existingInstallment = {
        id: 'installment-id',
        user,
        status: InstallmentStatus.PENDING,
        paymentMethod: { id: 'old-method' },
      } as Installment;

      const dto: UpdateInstallmentDto = {
        value: 200,
        billingMonth: new Date('2024-05-01'),
      };

      installmentRepo.findOne.mockResolvedValue(existingInstallment);
      installmentRepo.save.mockResolvedValue({ ...existingInstallment, ...dto });

      const result = await service.update(user, existingInstallment.id, dto);

      expect(result.value).toBe(200);
      expect(result.billingMonth).toEqual(new Date('2024-05-01'));
    });

    it('should throw if installment not found on update', async () => {
      installmentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update({ id: 'uid' } as User, 'iid', {
          value: 100,
          billingMonth: new Date(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if trying to update a paid installment', async () => {
      installmentRepo.findOne.mockResolvedValue({
        id: 'iid',
        user: { id: 'uid' },
        status: InstallmentStatus.PAID,
      } as Installment);

      await expect(
        service.update({ id: 'uid' } as User, 'iid', {
          value: 200,
          billingMonth: new Date(),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw if trying to update a scheduled installment', async () => {
      installmentRepo.findOne.mockResolvedValue({
        id: 'iid',
        user: { id: 'uid' },
        status: InstallmentStatus.SCHEDULED,
      } as Installment);

      await expect(
        service.update({ id: 'uid' } as User, 'iid', {
          value: 200,
          billingMonth: new Date(),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw if payment method not found on update', async () => {
      installmentRepo.findOne.mockResolvedValue({
        id: 'iid',
        user: { id: 'uid' },
        status: InstallmentStatus.PENDING,
        paymentMethod: { id: 'pmi' },
      } as Installment);

      paymentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update({ id: 'uid' } as User, 'iid', {
          paymentMethodId: 'nonexistent-payment-method-id',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an installment successfully', async () => {
      const user = { id: 'user-id' } as User;

      const installment = {
        id: 'installment-id',
        user,
        status: InstallmentStatus.PENDING,
      } as Installment;

      installmentRepo.findOne.mockResolvedValue(installment);

      await service.remove(user, installment.id);

      expect(installmentRepo.remove).toHaveBeenCalledWith(installment);
    });

    it('should throw if installment not found on remove', async () => {
      installmentRepo.findOne.mockResolvedValue(null);
      await expect(service.remove({ id: 'uid' } as User, 'iid')).rejects.toThrow(NotFoundException);
    });

    it('should throw if installment is not pending on remove', async () => {
      installmentRepo.findOne.mockResolvedValue({
        id: 'iid',
        user: { id: 'uid' },
        status: InstallmentStatus.PAID,
      } as Installment);

      await expect(service.remove({ id: 'uid' } as User, 'iid')).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    it('should update installment status successfully', async () => {
      const user = { id: 'user-id' } as User;

      const installment = {
        id: 'installment-id',
        user,
        status: InstallmentStatus.PENDING,
      } as Installment;

      const dto: UpdateInstallmentStatusDto = { status: InstallmentStatus.SCHEDULED };

      installmentRepo.findOne.mockResolvedValue(installment);
      installmentRepo.save.mockResolvedValue({ ...installment, status: dto.status });

      const result = await service.updateStatus(user, installment.id, dto);

      expect(result.status).toBe(InstallmentStatus.SCHEDULED);
    });

    it('should throw if installment not found on update status', async () => {
      installmentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus({ id: 'uid' } as User, 'iid', { status: InstallmentStatus.PAID }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if trying to update the status of a paid installment', async () => {
      installmentRepo.findOne.mockResolvedValue({
        id: 'iid',
        status: InstallmentStatus.PAID,
      } as Installment);

      await expect(
        service.updateStatus({ id: 'uid' } as User, 'iid', { status: InstallmentStatus.PENDING }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw if trying to move from scheduled to pending', async () => {
      installmentRepo.findOne.mockResolvedValue({
        id: 'iid',
        status: InstallmentStatus.SCHEDULED,
      } as Installment);

      await expect(
        service.updateStatus({ id: 'uid' } as User, 'iid', { status: InstallmentStatus.PENDING }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
