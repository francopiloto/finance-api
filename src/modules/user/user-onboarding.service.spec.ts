import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DataSource, EntityManager, Repository } from 'typeorm';

import { AuthProvider } from '@modules/auth/auth.enums';
import { AuthService } from '@modules/auth/auth.service';
import { AuthAccount } from '@modules/auth/entities/auth-account.entity';

import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './entities/user.entity';
import { OnboardingStep } from './enums/onboarding-step.enum';
import { UserOnboardingService } from './user-onboarding.service';

const mockAuthService = () => ({ assignUserToAccount: jest.fn() });
const mockUserRepo = () => ({ create: jest.fn(), save: jest.fn() });

describe('UserOnboardingService', () => {
  let service: UserOnboardingService;

  let authService: jest.Mocked<AuthService>;
  let userRepo: jest.Mocked<Repository<User>>;
  let manager: jest.Mocked<EntityManager>;
  let dataSource: { transaction: jest.Mock };

  const createUserDto: CreateUserDto = { name: 'John Doe', email: 'john@example.com' };

  const user: User = {
    id: 'user-id',
    name: 'John Doe',
    email: 'john@example.com',
    onboardingStep: OnboardingStep.FINISH,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const account = {
    id: 'acc-id',
    provider: AuthProvider.LOCAL,
    email: 'john@example.com',
    verified: true,
    user: null,
  } as AuthAccount;

  const tokens = { accessToken: 'access', refreshToken: 'refresh' };

  beforeEach(async () => {
    manager = { getRepository: jest.fn() } as any;
    dataSource = { transaction: jest.fn().mockImplementation(async (cb) => cb(manager)) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserOnboardingService,
        { provide: AuthService, useFactory: mockAuthService },
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(UserOnboardingService);
    authService = module.get(AuthService);
    userRepo = module.get(getRepositoryToken(User));

    (manager.getRepository as jest.Mock).mockReturnValue(userRepo);
  });

  it('should create user and assign to account', async () => {
    userRepo.create.mockReturnValue(user);
    userRepo.save.mockResolvedValue(user);
    authService.assignUserToAccount.mockResolvedValue({ user, ...tokens });

    const result = await service.createUserAndAssignAccount(createUserDto, account, 'web');

    expect(userRepo.create).toHaveBeenCalledWith(createUserDto);
    expect(userRepo.save).toHaveBeenCalledWith(user);
    expect(authService.assignUserToAccount).toHaveBeenCalledWith(account, user, 'web', manager);
    expect(result).toEqual({ user, ...tokens });
  });

  it('should throw if account already has a user', async () => {
    const usedAccount = { ...account, user };

    await expect(
      service.createUserAndAssignAccount(createUserDto, usedAccount, 'api'),
    ).rejects.toThrow(ConflictException);

    expect(userRepo.create).not.toHaveBeenCalled();
    expect(authService.assignUserToAccount).not.toHaveBeenCalled();
  });

  it('should propagate errors thrown during user creation', async () => {
    userRepo.create.mockReturnValue(user);
    userRepo.save.mockRejectedValue(new Error('DB failure'));

    await expect(
      service.createUserAndAssignAccount(createUserDto, account, 'fallback'),
    ).rejects.toThrow('DB failure');
  });

  it('should propagate errors from assignUserToAccount', async () => {
    userRepo.create.mockReturnValue(user);
    userRepo.save.mockResolvedValue(user);
    authService.assignUserToAccount.mockRejectedValue(new Error('Token failure'));

    await expect(
      service.createUserAndAssignAccount(createUserDto, account, 'mobile'),
    ).rejects.toThrow('Token failure');
  });
});
