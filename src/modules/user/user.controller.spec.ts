import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockUserService = () => ({
  findOneByIdOrFail: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
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
  let service: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useFactory: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      service.findOneByIdOrFail.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw if user not found', async () => {
      service.findOneByIdOrFail.mockRejectedValue(new NotFoundException());

      await expect(controller.getProfile({ id: 'invalid' } as User)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a user profile', async () => {
      const dto: CreateUserDto = { name: mockUser.name, email: mockUser.email };
      service.create.mockResolvedValue(mockUser);

      const result = await controller.create(dto);
      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update user profile', async () => {
      const dto: UpdateUserDto = { name: 'Updated' };
      const updatedUser = { ...mockUser, ...dto };

      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update(mockUser, dto);
      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });
});
