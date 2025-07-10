import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';
import { UserOnboardingService } from './user-onboarding.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockUserService = () => ({
  findOneByIdOrFail: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
});

const mockOnboardingService = () => ({
  createUserAndAssignAccount: jest.fn(),
});

const mockUser: User = {
  id: 'user-id',
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;
  let onboardingService: jest.Mocked<UserOnboardingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useFactory: mockUserService },
        { provide: UserOnboardingService, useFactory: mockOnboardingService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
    onboardingService = module.get(UserOnboardingService);
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      userService.findOneByIdOrFail.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw if user not found', async () => {
      userService.findOneByIdOrFail.mockRejectedValue(new NotFoundException());

      await expect(controller.getProfile({ id: 'invalid' } as User)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and assign user profile', async () => {
      const dto: CreateUserDto = { name: mockUser.name, email: mockUser.email };
      const tokens = { accessToken: 'abc', refreshToken: 'xyz' };
      const resultMock = { user: mockUser, ...tokens };
      const accountMock = { id: 'acc-id' } as any;
      const device = 'web';

      onboardingService.createUserAndAssignAccount.mockResolvedValue(resultMock);

      const result = await controller.create(dto, accountMock, device);

      expect(result).toEqual(resultMock);

      expect(onboardingService.createUserAndAssignAccount).toHaveBeenCalledWith(
        dto,
        accountMock,
        device,
      );
    });
  });

  describe('update', () => {
    it('should update user profile', async () => {
      const dto: UpdateUserDto = { name: 'Updated' };
      const updatedUser = { ...mockUser, ...dto };

      userService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(mockUser, dto);
      expect(result).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });
});
