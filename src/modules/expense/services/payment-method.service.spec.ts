import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';

import { PaymentMethodService } from './payment-method.service';
import { Installment } from '../entities/installment.entity';
import { PaymentMethod } from '../entities/payment-method.entity';

const mockPaymentRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const mockInstallmentRepo = () => ({ findOne: jest.fn() });

describe('PaymentMethodService', () => {
  let service: PaymentMethodService;
  let paymentRepo: jest.Mocked<Repository<PaymentMethod>>;
  let installmentRepo: jest.Mocked<Repository<Installment>>;

  const user: User = { id: 'user-id' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentMethodService,
        { provide: getRepositoryToken(PaymentMethod), useFactory: mockPaymentRepo },
        { provide: getRepositoryToken(Installment), useFactory: mockInstallmentRepo },
      ],
    }).compile();

    service = module.get<PaymentMethodService>(PaymentMethodService);
    paymentRepo = module.get(getRepositoryToken(PaymentMethod));
    installmentRepo = module.get(getRepositoryToken(Installment));
  });

  describe('findAll', () => {
    it('should return all payment methods for the user', async () => {
      const methods = [{ id: '1' }, { id: '2' }];
      paymentRepo.find.mockResolvedValue(methods as PaymentMethod[]);

      const result = await service.findAll(user);

      expect(result).toEqual(methods);
      expect(paymentRepo.find).toHaveBeenCalledWith({ where: { user }, order: { name: 'ASC' } });
    });
  });

  describe('create', () => {
    it('should create a payment method for the user', async () => {
      const dto = { name: 'Credit Card', statementClosingDay: 10, dueDay: 20 };
      const method = { id: 'pmid', ...dto, user } as PaymentMethod;

      paymentRepo.create.mockReturnValue(method);
      paymentRepo.save.mockResolvedValue(method);

      const result = await service.create(user, dto);

      expect(result).toEqual({ id: 'pmid', ...dto });
      expect(paymentRepo.create).toHaveBeenCalledWith({ ...dto, user });
      expect(paymentRepo.save).toHaveBeenCalledWith(method);
    });
  });

  describe('update', () => {
    it('should update a payment method', async () => {
      const id = 'pmid';
      const dto = { name: 'Updated Name' };
      const existing = { id, name: 'Old Name', user } as PaymentMethod;

      paymentRepo.findOne.mockResolvedValue(existing);
      paymentRepo.save.mockResolvedValue({ ...existing, ...dto });

      const result = await service.update(user, id, dto);

      expect(result).toEqual({ ...existing, ...dto });
    });

    it('should throw if method not found on update', async () => {
      paymentRepo.findOne.mockResolvedValue(null);

      await expect(service.update(user, 'invalid-id', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a method if no dependencies exist', async () => {
      const method = { id: 'pmid', name: 'Card', user } as PaymentMethod;

      installmentRepo.findOne.mockResolvedValue(null);
      paymentRepo.findOne.mockResolvedValue(method);
      paymentRepo.remove.mockResolvedValue(method);

      const result = await service.remove(user, method.id);
      expect(result).toEqual(method);
    });

    it('should throw if method not found on remove', async () => {
      paymentRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(user, 'invalid')).rejects.toThrow(NotFoundException);
    });

    it('should throw if method has dependent installments', async () => {
      const method = { id: 'pmid', name: 'Card', user } as PaymentMethod;

      paymentRepo.findOne.mockResolvedValue(method);
      installmentRepo.findOne.mockResolvedValue({ id: 'iid' } as Installment);

      await expect(service.remove(user, method.id)).rejects.toThrow(ConflictException);
    });
  });
});
