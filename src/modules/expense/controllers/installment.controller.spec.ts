import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { mockOwnershipProviders } from 'test/setup/owner-entity.providers';

import { User } from '@modules/user/entities/user.entity';

import { InstallmentController } from './installment.controller';
import { CreateInstallmentDto } from '../dtos/create-installment.dto';
import { UpdateInstallmentStatusDto } from '../dtos/update-installment-status.dto';
import { UpdateInstallmentDto } from '../dtos/update-installment.dto';
import { Installment } from '../entities/installment.entity';
import { InstallmentStatus } from '../expense.constants';
import { InstallmentService } from '../services/installment.service';

const mockInstallmentService = () => ({
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  updateStatus: jest.fn(),
});

describe('InstallmentController', () => {
  let controller: InstallmentController;
  let service: jest.Mocked<InstallmentService>;

  const user: User = { id: 'user-id' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstallmentController],
      providers: [
        { provide: InstallmentService, useFactory: mockInstallmentService },
        ...mockOwnershipProviders,
      ],
    }).compile();

    controller = module.get(InstallmentController);
    service = module.get(InstallmentService);
  });

  describe('findMany', () => {
    it('should call service.findMany with user and filters', async () => {
      const mockFilters = { status: InstallmentStatus.PAID };
      const mockData = [{ id: 'iid' }] as Installment[];

      service.findMany.mockResolvedValue([mockData, mockData.length]);

      const result = await controller.findMany(user, mockFilters);

      expect(result).toEqual({
        data: mockData,
        page: null,
        pageSize: null,
        total: mockData.length,
      });

      expect(service.findMany).toHaveBeenCalledWith(user, mockFilters);
    });
  });

  describe('create', () => {
    it('should call service.create on create()', async () => {
      const dto: CreateInstallmentDto = {
        value: 100,
        billingMonth: new Date(),
        paymentMethodId: 'pmid',
      };

      const result = { id: 'installment-id' };
      service.create.mockResolvedValue(result as any);

      expect(await controller.create(user, 'expense-id', dto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(user, 'expense-id', dto);
    });

    it('should throw if service.create fails', async () => {
      service.create.mockRejectedValue(new NotFoundException());

      await expect(
        controller.create(user, 'expense-id', {
          value: 100,
          billingMonth: new Date(),
          paymentMethodId: 'pmid',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should call service.update on update()', async () => {
      const dto: UpdateInstallmentDto = {
        value: 150,
        billingMonth: new Date(),
      };

      const result = { id: 'installment-id', ...dto };
      service.update.mockResolvedValue(result as any);

      expect(await controller.update(user, 'installment-id', dto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(user, 'installment-id', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove on remove()', async () => {
      const installment = { id: 'installment-id' } as Installment;
      service.remove.mockResolvedValue(installment);

      expect(await controller.remove(user, 'installment-id')).toEqual(installment);
      expect(service.remove).toHaveBeenCalledWith(user, 'installment-id');
    });
  });

  describe('updateStatus', () => {
    it('should call service.updateStatus on updateStatus()', async () => {
      const dto: UpdateInstallmentStatusDto = { status: InstallmentStatus.PAID };
      const result = { id: 'installment-id', ...dto };

      service.updateStatus.mockResolvedValue(result as any);
      expect(await controller.updateStatus(user, 'installment-id', dto)).toEqual(result);
      expect(service.updateStatus).toHaveBeenCalledWith(user, 'installment-id', dto);
    });
  });
});
