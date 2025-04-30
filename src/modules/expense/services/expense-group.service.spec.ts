import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';

import { ExpenseGroupService } from './expense-group.service';
import { ExpenseGroup } from '../entities/expense-group.entity';
import { Expense } from '../entities/expense.entity';

const mockExpenseGroupRepo = () => ({
  createQueryBuilder: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const mockExpenseRepo = () => ({ findOne: jest.fn() });

describe('ExpenseGroupService', () => {
  let service: ExpenseGroupService;
  let groupRepo: jest.Mocked<Repository<ExpenseGroup>>;
  let expenseRepo: jest.Mocked<Repository<Expense>>;

  const user: User = { id: 'user-id' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseGroupService,
        { provide: getRepositoryToken(ExpenseGroup), useFactory: mockExpenseGroupRepo },
        { provide: getRepositoryToken(Expense), useFactory: mockExpenseRepo },
      ],
    }).compile();

    service = module.get<ExpenseGroupService>(ExpenseGroupService);
    groupRepo = module.get(getRepositoryToken(ExpenseGroup));
    expenseRepo = module.get(getRepositoryToken(Expense));
  });

  it('should return all groups for the user', async () => {
    const mockQB = {
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]),
    } as unknown as SelectQueryBuilder<ExpenseGroup>;

    groupRepo.createQueryBuilder.mockReturnValue(mockQB);

    const result = await service.findAll(user);

    expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    expect(mockQB.where).toHaveBeenCalledWith('group.created_by = :userId', { userId: user.id });
    expect(mockQB.orWhere).toHaveBeenCalledWith('group.created_by IS NULL');
    expect(mockQB.orderBy).toHaveBeenCalledWith('group.name', 'ASC');
  });

  it('should create a new group for the user', async () => {
    const dto = { name: 'Test Group' };
    const group = { id: 'gid', name: dto.name, createdBy: user } as ExpenseGroup;

    groupRepo.create.mockReturnValue(group);
    groupRepo.save.mockResolvedValue(group);

    const result = await service.create(user, dto);

    expect(result).toEqual(group);
    expect(groupRepo.create).toHaveBeenCalledWith({ ...dto, createdBy: user });
    expect(groupRepo.save).toHaveBeenCalledWith(group);
  });

  it('should update an existing group for the user', async () => {
    const id = 'gid';
    const dto = { name: 'Updated Name' };
    const group = { id, name: 'Old Name', createdBy: user } as ExpenseGroup;

    groupRepo.findOne.mockResolvedValue(group);
    groupRepo.save.mockResolvedValue({ ...group, ...dto });

    const result = await service.update(user, id, dto);
    expect(result).toEqual({ ...group, ...dto });
  });

  it('should throw if group not found on update', async () => {
    groupRepo.findOne.mockResolvedValue(null);

    await expect(service.update(user, 'not-found', { name: 'New Name' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should remove a group if no dependencies exist', async () => {
    const group = { id: 'gid', name: 'Test', createdBy: user } as ExpenseGroup;

    groupRepo.findOne.mockResolvedValue(group);
    expenseRepo.findOne.mockResolvedValue(null);
    groupRepo.remove.mockResolvedValue(group);

    const result = await service.remove(user, group.id);
    expect(result).toEqual(group);
  });

  it('should throw if group not found on remove', async () => {
    groupRepo.findOne.mockResolvedValue(null);
    await expect(service.remove(user, 'not-found')).rejects.toThrow(NotFoundException);
  });

  it('should throw if group has dependent expenses', async () => {
    const group = { id: 'gid', name: 'Test', createdBy: user } as ExpenseGroup;
    groupRepo.findOne.mockResolvedValue(group);
    expenseRepo.findOne.mockResolvedValue({ id: 'eid' } as Expense);

    await expect(service.remove(user, group.id)).rejects.toThrow(ConflictException);
  });
});
