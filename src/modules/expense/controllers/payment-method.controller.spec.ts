import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { mockOwnershipProviders } from 'test/setup/owner-entity.providers';

import { User } from '@modules/user/entities/user.entity';

import { PaymentMethodController } from './payment-method.controller';
import { CreatePaymentMethodDto } from '../dtos/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dtos/update-payment-method.dto';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentMethodService } from '../services/payment-method.service';

const mockPaymentService = () => ({
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('PaymentMethodController', () => {
  let controller: PaymentMethodController;
  let service: jest.Mocked<PaymentMethodService>;

  const user: User = { id: 'user-id' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentMethodController],
      providers: [
        { provide: PaymentMethodService, useFactory: mockPaymentService },
        ...mockOwnershipProviders,
      ],
    }).compile();

    controller = module.get<PaymentMethodController>(PaymentMethodController);
    service = module.get(PaymentMethodService);
  });

  describe('findAll', () => {
    it('should return all methods for user', async () => {
      const methods = [{ id: '1' }, { id: '2' }] as PaymentMethod[];
      service.findAll.mockResolvedValue(methods);

      const result = await controller.findAll(user);

      expect(result).toEqual(methods);
      expect(service.findAll).toHaveBeenCalledWith(user);
    });
  });

  describe('create', () => {
    it('should create a method', async () => {
      const dto: CreatePaymentMethodDto = {
        name: 'Credit Card',
        statementClosingDay: 10,
        dueDay: 20,
      };

      const created = { id: 'pmid', ...dto } as PaymentMethod;

      service.create.mockResolvedValue(created);

      expect(await controller.create(user, dto)).toEqual(created);
      expect(service.create).toHaveBeenCalledWith(user, dto);
    });
  });

  describe('update', () => {
    it('should update a method', async () => {
      const id = 'pmid';
      const dto: UpdatePaymentMethodDto = { name: 'Updated' };
      const updated = { id, ...dto } as PaymentMethod;

      service.update.mockResolvedValue(updated);

      expect(await controller.update(user, id, dto)).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(user, id, dto);
    });

    it('should throw if update fails', async () => {
      service.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(user, 'invalid', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a method', async () => {
      const id = 'pmid';
      const removed = { id } as PaymentMethod;

      service.remove.mockResolvedValue(removed);

      const result = await controller.remove(user, id);

      expect(result).toEqual(removed);
      expect(service.remove).toHaveBeenCalledWith(user, id);
    });
  });
});
