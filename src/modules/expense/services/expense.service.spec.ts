import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityTarget, Repository } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';

import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from '../dtos/create-expense.dto';
import { UpdateExpenseDto } from '../dtos/update-expense.dto';
import { ExpenseGroup } from '../entities/expense-group.entity';
import { Expense } from '../entities/expense.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { ExpensePriority, InstallmentStatus } from '../expense.constants';

const mockExpenseRepo = () => ({ findOne: jest.fn(), save: jest.fn() });
const mockGroupRepo = () => ({ createQueryBuilder: jest.fn(), findOne: jest.fn() });

describe('ExpenseService', () => {
  let service: ExpenseService;
  let expenseRepo: jest.Mocked<Repository<Expense>>;
  let groupRepo: jest.Mocked<Repository<ExpenseGroup>>;
  let dataSource: { transaction: jest.Mock };

  const user: User = { id: 'user-id' } as User;

  beforeEach(async () => {
    dataSource = { transaction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        { provide: getRepositoryToken(Expense), useFactory: mockExpenseRepo },
        { provide: getRepositoryToken(ExpenseGroup), useFactory: mockGroupRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
    expenseRepo = module.get(getRepositoryToken(Expense));
    groupRepo = module.get(getRepositoryToken(ExpenseGroup));
  });

  describe('create', () => {
    it('should create expense and installments in a transaction', async () => {
      const dto: CreateExpenseDto = {
        groupId: 'egid',
        value: 300,
        numInstallments: 3,
        paymentMethodId: 'pmid',
        date: new Date('2024-01-01'),
        description: 'desc',
        priority: ExpensePriority.ESSENTIAL,
        beneficiary: 'store',
      };

      const group = { id: dto.groupId } as ExpenseGroup;
      const paymentMethod = { id: dto.paymentMethodId } as PaymentMethod;
      const expense = { id: 'exp-id', user, group } as Expense;

      jest.spyOn(service, 'findGroup').mockResolvedValue(group);

      dataSource.transaction.mockImplementation(async (cb) => {
        const manager: any = {
          getRepository: jest.fn().mockReturnValue(groupRepo),
          findOne: jest
            .fn()
            .mockImplementation((type: EntityTarget<any>) =>
              type === PaymentMethod ? paymentMethod : expense,
            ),
          create: jest.fn().mockImplementation((_, obj) => obj),
          save: jest.fn().mockImplementation(async (obj) => obj),
        };

        return cb(manager);
      });

      const result = await service.create(user, dto);

      expect(result?.id).toBe('exp-id');
      expect(result?.user).toEqual(user);
    });

    it('should throw if payment method not found', async () => {
      const dto: CreateExpenseDto = {
        groupId: 'egid',
        paymentMethodId: 'pmid',
        value: 100,
        numInstallments: 1,
        date: new Date(),
        priority: ExpensePriority.ESSENTIAL,
      };

      jest.spyOn(service, 'findGroup').mockResolvedValue({ id: 'egid' } as ExpenseGroup);

      dataSource.transaction.mockImplementation(async (cb) => {
        const manager: any = {
          getRepository: jest.fn().mockReturnValue(groupRepo),
          findOne: jest.fn().mockResolvedValue(null),
        };

        return cb(manager);
      });

      await expect(service.create(user, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an expense if it exists and belongs to user', async () => {
      const id = 'expense-id';
      const dto: UpdateExpenseDto = { description: 'Updated' };
      const found = { id, user, description: 'Old' } as Expense;

      expenseRepo.findOne.mockResolvedValue(found);
      expenseRepo.save.mockResolvedValue({ ...found, ...dto });

      const result = await service.update(user, id, dto);
      expect(result).toEqual({ ...found, ...dto });
    });

    it('should throw if expense not found', async () => {
      expenseRepo.findOne.mockResolvedValue(null);

      await expect(service.update(user, 'invalid-id', { description: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if expense group not found', async () => {
      groupRepo.findOne.mockResolvedValue(null);

      await expect(service.update(user, 'eid', { description: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove expense if all installments are pending', async () => {
      const expense = {
        id: 'exp',
        user,
        installments: [{ status: InstallmentStatus.PENDING }],
      } as Expense;

      dataSource.transaction.mockImplementation((cb) =>
        cb({
          findOne: jest.fn().mockResolvedValue(expense),
          remove: jest.fn().mockResolvedValue(expense),
        }),
      );

      const result = await service.remove(user, expense.id);
      expect(result).toEqual(expense);
    });

    it('should throw if any installment is not pending', async () => {
      const expense = {
        id: 'exp',
        user,
        installments: [{ status: InstallmentStatus.PAID }],
      } as Expense;

      dataSource.transaction.mockImplementation((cb) =>
        cb({ findOne: jest.fn().mockResolvedValue(expense) }),
      );

      await expect(service.remove(user, expense.id)).rejects.toThrow(ConflictException);
    });

    it('should throw if expense not found', async () => {
      dataSource.transaction.mockImplementation((cb) =>
        cb({ findOne: jest.fn().mockResolvedValue(null) }),
      );

      await expect(service.remove(user, 'invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
