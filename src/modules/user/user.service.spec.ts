import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

const mockUserRepo = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  const user: User = { id: 'user-id', name: 'John', email: 'john@example.com' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: getRepositoryToken(User), useFactory: mockUserRepo }],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
  });

  describe('findOneById', () => {
    it('should return a user', async () => {
      userRepo.findOneBy.mockResolvedValue(user);

      const result = await service.findOneById(user.id);
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      userRepo.findOneBy.mockResolvedValue(null);

      const result = await service.findOneById('invalid');
      expect(result).toBeNull();
    });
  });

  describe('findOneByIdOrFail', () => {
    it('should return a user', async () => {
      userRepo.findOneBy.mockResolvedValue(user);

      const result = await service.findOneByIdOrFail(user.id);
      expect(result).toEqual(user);
    });

    it('should throw if user not found', async () => {
      userRepo.findOneBy.mockResolvedValue(null);
      await expect(service.findOneByIdOrFail('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const dto: UpdateUserDto = { name: 'Updated Name' };

      userRepo.findOneBy.mockResolvedValue(user);
      userRepo.save.mockResolvedValue({ ...user, ...dto });

      const result = await service.update(user.id, dto);
      expect(result).toEqual({ ...user, ...dto });
    });
  });
});
