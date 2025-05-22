import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';

import { CreateWalletDto } from './dtos/create-wallet.dto';
import { UpdateWalletDto } from './dtos/update-wallet.dto';
import { Wallet } from './entities/wallet.entity';
import { WalletService } from './wallet.service';

const mockWalletRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('WalletService', () => {
  let service: WalletService;
  let walletRepo: jest.Mocked<Repository<Wallet>>;

  const user: User = { id: 'user-id' } as User;

  const wallet: Wallet = {
    id: 'wallet-id',
    name: 'Main Wallet',
    description: 'My main wallet',
    user,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getRepositoryToken(Wallet), useFactory: mockWalletRepo },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepo = module.get(getRepositoryToken(Wallet));
  });

  describe('findAll', () => {
    it('should return all wallets for a user', async () => {
      walletRepo.find.mockResolvedValue([wallet]);

      const result = await service.findAll(user);

      expect(walletRepo.find).toHaveBeenCalledWith({ where: { user }, order: { name: 'ASC' } });
      expect(result).toEqual([wallet]);
    });
  });

  describe('findOneByIdOrFail', () => {
    it('should return the wallet if found', async () => {
      walletRepo.findOne.mockResolvedValue(wallet);

      const result = await service.findOneByIdOrFail(user, wallet.id);
      expect(result).toEqual(wallet);
    });

    it('should throw NotFoundException if not found', async () => {
      walletRepo.findOne.mockResolvedValue(null);

      await expect(service.findOneByIdOrFail(user, 'non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return the new wallet', async () => {
      const dto: CreateWalletDto = { name: 'New Wallet', description: 'Test' };
      const created = { ...dto, user };

      walletRepo.create.mockReturnValue(created as Wallet);
      walletRepo.save.mockResolvedValue(wallet);

      const result = await service.create(user, dto);

      expect(walletRepo.create).toHaveBeenCalledWith({ ...dto, user });
      expect(walletRepo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(wallet);
    });
  });

  describe('update', () => {
    it('should update and return the wallet', async () => {
      const dto: UpdateWalletDto = { name: 'Updated Wallet' };

      walletRepo.findOne.mockResolvedValue(wallet);
      walletRepo.save.mockResolvedValue({ ...wallet, ...dto });

      const result = await service.update(user, wallet.id, dto);
      expect(result.name).toBe('Updated Wallet');
    });
  });

  describe('remove', () => {
    it('should remove and return the wallet', async () => {
      walletRepo.findOne.mockResolvedValue(wallet);
      walletRepo.remove.mockResolvedValue(wallet);

      const result = await service.remove(user, wallet.id);
      expect(result).toEqual(wallet);
    });
  });
});
