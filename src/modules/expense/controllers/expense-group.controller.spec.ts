import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { IsOwnerGuard } from '@modules/auth/guards/owner.guard';
import { User } from '@modules/user/entities/user.entity';

import { ExpenseGroupController } from './expense-group.controller';
import { CreateExpenseGroupDto } from '../dtos/create-expense-group.dto';
import { UpdateExpenseGroupDto } from '../dtos/update-expense-group.dto';
import { ExpenseGroup } from '../entities/expense-group.entity';
import { ExpenseGroupService } from '../services/expense-group.service';

const mockExpenseGroupService = () => ({
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ExpenseGroupController', () => {
  let controller: ExpenseGroupController;
  let service: jest.Mocked<ExpenseGroupService>;

  const user: User = { id: 'user-id' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseGroupController],
      providers: [
        { provide: ExpenseGroupService, useFactory: mockExpenseGroupService },
        { provide: IsOwnerGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    controller = module.get<ExpenseGroupController>(ExpenseGroupController);
    service = module.get(ExpenseGroupService);
  });

  it('should return all groups for the user', async () => {
    const groups = [{ id: '1' }, { id: '2' }] as ExpenseGroup[];
    service.findAll.mockResolvedValue(groups);

    const result = await controller.findAll(user);

    expect(result).toEqual(groups);
    expect(service.findAll).toHaveBeenCalledWith(user);
  });

  it('should create a new expense group', async () => {
    const dto: CreateExpenseGroupDto = { name: 'Group A' };
    const result = { id: '1', createdBy: user, ...dto };

    service.create.mockResolvedValue(result);

    expect(await controller.create(user, dto)).toEqual(result);
    expect(service.create).toHaveBeenCalledWith(user, dto);
  });

  it('should update an expense group', async () => {
    const id = 'gid';
    const dto: UpdateExpenseGroupDto = { name: 'Updated Name' };
    const updated = { id, name: dto.name } as ExpenseGroup;

    service.update.mockResolvedValue(updated);

    expect(await controller.update(user, id, dto)).toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(user, id, dto);
  });

  it('should remove an expense group', async () => {
    const id = 'gid';
    const result = { id } as ExpenseGroup;

    service.remove.mockResolvedValue(result);

    expect(await controller.remove(user, id)).toEqual(result);
    expect(service.remove).toHaveBeenCalledWith(user, id);
  });

  it('should throw if update fails', async () => {
    service.update.mockRejectedValue(new NotFoundException());

    await expect(controller.update(user, 'invalid-id', { name: 'test' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
