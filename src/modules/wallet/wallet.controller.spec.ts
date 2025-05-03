import { Test, TestingModule } from '@nestjs/testing';
import { mockOwnershipProviders } from 'test/setup/owner-entity.providers';
import { v4 as uuidv4 } from 'uuid';

import { User } from '@modules/user/entities/user.entity';

import { CreateWalletDto } from './dtos/create-wallet.dto';
import { UpdateWalletDto } from './dtos/update-wallet.dto';
import { Wallet } from './entities/wallet.entity';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

describe('WalletController', () => {
  let controller: WalletController;
  let service: WalletService;

  const userMock = { id: uuidv4() } as User;

  const walletMock = {
    id: uuidv4(),
    name: 'Main Wallet',
    description: 'My main wallet',
    user: userMock,
  } as Wallet;

  const serviceMock = {
    findAll: jest.fn().mockResolvedValue([walletMock]),
    findOneByIdOrFail: jest.fn().mockResolvedValue(walletMock),
    create: jest.fn().mockResolvedValue(walletMock),
    update: jest.fn().mockResolvedValue(walletMock),
    remove: jest.fn().mockResolvedValue(walletMock),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: serviceMock }, ...mockOwnershipProviders],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all wallets for a user', async () => {
      const result = await controller.findAll(userMock);
      expect(result).toEqual([walletMock]);
      expect(service.findAll).toHaveBeenCalledWith(userMock);
    });
  });

  describe('findOne', () => {
    it('should return a wallet by ID', async () => {
      const result = await controller.findOne(userMock, walletMock.id);
      expect(result).toEqual(walletMock);
      expect(service.findOneByIdOrFail).toHaveBeenCalledWith(userMock, walletMock.id);
    });
  });

  describe('create', () => {
    it('should create a new wallet', async () => {
      const dto: CreateWalletDto = { name: 'Investments', description: 'For stocks' };
      const result = await controller.create(userMock, dto);
      expect(result).toEqual(walletMock);
      expect(service.create).toHaveBeenCalledWith(userMock, dto);
    });
  });

  describe('update', () => {
    it('should update an existing wallet', async () => {
      const dto: UpdateWalletDto = { name: 'Updated Name' };
      const result = await controller.update(userMock, walletMock.id, dto);
      expect(result).toEqual(walletMock);
      expect(service.update).toHaveBeenCalledWith(userMock, walletMock.id, dto);
    });
  });

  describe('remove', () => {
    it('should remove a wallet', async () => {
      const result = await controller.remove(userMock, walletMock.id);
      expect(result).toEqual(walletMock);
      expect(service.remove).toHaveBeenCalledWith(userMock, walletMock.id);
    });
  });
});
