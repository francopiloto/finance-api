import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/user.service';

import { AuthService } from './auth.service';
import { SignInUserDto } from './dtos/signin-user.dto';
import { SignUpUserDto } from './dtos/signup-user.dto';
import { AuthToken } from './entities/token.entity';
import { TokenFactory } from './token/token.factory';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// eslint-disable-next-line import/order
import * as bcrypt from 'bcrypt';

const mockTokenRepo = () => ({ delete: jest.fn(), upsert: jest.fn(), create: jest.fn() });
const mockTokenFactory = () => ({ generateTokens: jest.fn() });

const mockUserService = () => ({
  findOneByEmail: jest.fn(),
  create: jest.fn(),
  findOneByEmailWithPassword: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;

  let tokenRepo: jest.Mocked<Repository<AuthToken>>;
  let tokenFactory: jest.Mocked<TokenFactory>;
  let userService: jest.Mocked<UserService>;

  const user: User = { id: 'user-id' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(AuthToken), useFactory: mockTokenRepo },
        { provide: TokenFactory, useFactory: mockTokenFactory },
        { provide: UserService, useFactory: mockUserService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    tokenRepo = module.get(getRepositoryToken(AuthToken));
    tokenFactory = module.get(TokenFactory);
    userService = module.get(UserService);
  });

  describe('signup', () => {
    const dto: SignUpUserDto = { name: 'John', email: 'john@example.com', password: 'plain' };

    it('should hash password and create user', async () => {
      const hashed = 'hashed_pw';

      userService.findOneByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashed);

      await service.signup(dto);
      expect(userService.create).toHaveBeenCalledWith({ ...dto, password: hashed });
    });

    it('should throw if email is already in use', async () => {
      userService.findOneByEmail.mockResolvedValue(user);
      await expect(service.signup(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('signin', () => {
    const dto: SignInUserDto = { email: 'john@example.com', password: '123456', device: 'mobile' };

    it('should return access and refresh tokens if password is valid', async () => {
      const result = { accessToken: 'a', refreshToken: 'b' };

      userService.findOneByEmailWithPassword.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue(result);

      const response = await service.signin(dto);
      expect(response).toEqual(result);
    });

    it('should throw if user not found', async () => {
      userService.findOneByEmailWithPassword.mockResolvedValue(null);
      await expect(service.signin(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is invalid', async () => {
      userService.findOneByEmailWithPassword.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signin(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signout', () => {
    it('should delete token for user/device', async () => {
      await service.signout('user-id', 'web');
      expect(tokenRepo.delete).toHaveBeenCalledWith({ user, device: 'web' });
    });
  });

  describe('generateTokens', () => {
    it('should return a new pair of tokens on a valid refresh_token', async () => {
      const expected = { accessToken: 'x', refreshToken: 'y' };

      tokenFactory.generateTokens.mockResolvedValue({
        ...expected,
        tokenRecord: { user, device: 'default', refreshTokenHash: 'hashed', expiresAt: new Date() },
      });

      const result = await service.generateTokens(user);
      expect(result).toEqual(expected);
    });
  });
});
