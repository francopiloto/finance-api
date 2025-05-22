import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { mockOwnershipProviders } from 'test/setup/owner-entity.providers';

import { User } from '@modules/user/entities/user.entity';

import { ExpenseController } from './expense.controller';
import { CreateExpenseDto } from '../dtos/create-expense.dto';
import { UpdateExpenseDto } from '../dtos/update-expense.dto';
import { ExpenseGroup } from '../entities/expense-group.entity';
import { Expense } from '../entities/expense.entity';
import { ExpensePriority } from '../expense.constants';
import { ExpenseService } from '../services/expense.service';

const mockExpenseService = () => ({
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ExpenseController', () => {
  let controller: ExpenseController;
  let service: jest.Mocked<ExpenseService>;

  const user: User = { id: 'user-id' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [
        { provide: ExpenseService, useFactory: mockExpenseService },
        ...mockOwnershipProviders,
      ],
    }).compile();

    controller = module.get<ExpenseController>(ExpenseController);
    service = module.get(ExpenseService);
  });

  describe('create', () => {
    it('should create a new expense', async () => {
      const dto = {
        groupId: 'gid',
        value: 100,
        numInstallments: 2,
        paymentMethodId: 'pmi',
        date: new Date(),
        priority: ExpensePriority.ESSENTIAL,
      } as CreateExpenseDto;

      const expense = {
        id: 'exp-id',
        user,
        group: { id: dto.groupId } as ExpenseGroup,
        date: dto.date,
        priority: dto.priority,
        installments: [],
      };

      service.create.mockResolvedValue(expense);

      const result = await controller.create(user, dto);

      expect(result).toEqual(expense);
      expect(service.create).toHaveBeenCalledWith(user, dto);
    });
  });

  describe('update', () => {
    it('should update an expense', async () => {
      const id = 'exp-id';
      const dto: UpdateExpenseDto = { description: 'updated' };
      const updated = { id, ...dto } as Expense;

      service.update.mockResolvedValue(updated);
      const result = await controller.update(user, id, dto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(user, id, dto);
    });

    it('should throw if not found', async () => {
      service.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(user, 'invalid', { description: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an expense', async () => {
      const id = 'exp-id';
      const removed = { id } as Expense;

      service.remove.mockResolvedValue(removed);
      const result = await controller.remove(user, id);

      expect(result).toEqual(removed);
      expect(service.remove).toHaveBeenCalledWith(user, id);
    });

    it('should throw if not found', async () => {
      service.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove(user, 'invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
