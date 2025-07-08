import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AuthProvider } from './auth.enums';
import { AuthService } from './auth.service';
import { LoginLocalDto } from './dtos/login-local.dto';
import { RegisterLocalDto } from './dtos/register-local.dto';
import { AuthAccount } from './entities/auth-account.entity';
import { AuthToken } from './entities/token.entity';
import { TokenFactory } from './token/token.factory';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// eslint-disable-next-line import/order
import * as bcrypt from 'bcrypt';

const mockAccountRepo = () => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

const mockTokenRepo = () => ({ delete: jest.fn(), upsert: jest.fn(), create: jest.fn() });
const mockTokenFactory = () => ({ generateTokens: jest.fn() });

describe('AuthService', () => {
  let service: AuthService;

  let accountRepo: jest.Mocked<Repository<AuthAccount>>;
  let tokenRepo: jest.Mocked<Repository<AuthToken>>;
  let tokenFactory: jest.Mocked<TokenFactory>;

  const account: AuthAccount = {
    id: 'acc-id',
    provider: AuthProvider.LOCAL,
    email: 'john@example.com',
    password: 'hashed',
    verified: true,
    user: { id: 'user-id' } as any,
  } as AuthAccount;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(AuthAccount), useFactory: mockAccountRepo },
        { provide: getRepositoryToken(AuthToken), useFactory: mockTokenRepo },
        { provide: TokenFactory, useFactory: mockTokenFactory },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    accountRepo = module.get(getRepositoryToken(AuthAccount));
    tokenRepo = module.get(getRepositoryToken(AuthToken));
    tokenFactory = module.get(TokenFactory);
  });

  describe('registerLocal', () => {
    const dto: RegisterLocalDto = { email: 'john@example.com', password: 'plain' };

    it('should hash password, create account, and return tokens', async () => {
      const hashed = 'hashed_pw';
      const tokens = { accessToken: 'a', refreshToken: 'b' };

      const mockAccount = {
        provider: AuthProvider.LOCAL,
        email: dto.email,
        password: hashed,
        verified: false,
      } as AuthAccount;

      accountRepo.findOneBy.mockResolvedValue(null);
      accountRepo.create.mockReturnValue(mockAccount);
      accountRepo.save.mockResolvedValue(mockAccount);

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashed);
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue(tokens);

      const result = await service.registerLocal(dto);

      expect(accountRepo.findOneBy).toHaveBeenCalledWith({
        provider: AuthProvider.LOCAL,
        email: dto.email,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(accountRepo.create).toHaveBeenCalledWith(mockAccount);
      expect(accountRepo.save).toHaveBeenCalledWith(mockAccount);
      expect(result).toEqual(tokens);
    });

    it('should throw if account already exists', async () => {
      accountRepo.findOneBy.mockResolvedValue(account);
      await expect(service.registerLocal(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('loginLocal', () => {
    const dto: LoginLocalDto = { email: 'john@example.com', password: 'plain', device: 'web' };

    it('should login with valid credentials', async () => {
      const tokens = { accessToken: 'a', refreshToken: 'b' };

      accountRepo.findOne.mockResolvedValue(account);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue(tokens);

      const result = await service.loginLocal(dto);

      expect(result).toEqual(tokens);
    });

    it('should throw if account not found or password mismatch', async () => {
      accountRepo.findOne.mockResolvedValue(null);
      await expect(service.loginLocal(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is invalid', async () => {
      accountRepo.findOne.mockResolvedValue(account);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.loginLocal(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if account not verified', async () => {
      accountRepo.findOne.mockResolvedValue({ ...account, verified: false });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.loginLocal(dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('loginOAuth', () => {
    const profile = {
      provider: AuthProvider.GOOGLE,
      providerUserId: 'google-id-123',
      email: 'john@example.com',
      avatarUrl: 'http://avatar.com/john.png',
    };

    const tokens = { accessToken: 'access', refreshToken: 'refresh' };

    it('should create a new account and return tokens if no match is found', async () => {
      const newAccount = { ...profile, verified: true } as AuthAccount;

      accountRepo.findOne.mockResolvedValueOnce(null); // find by provider + id/email
      accountRepo.findOne.mockResolvedValueOnce(null); // find existing by email
      accountRepo.create.mockReturnValue(newAccount);
      accountRepo.save.mockResolvedValue(newAccount);
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue(tokens);

      const result = await service.loginOAuth(profile, 'browser');

      expect(accountRepo.findOne).toHaveBeenCalledTimes(2);
      expect(accountRepo.create).toHaveBeenCalledWith(newAccount);
      expect(accountRepo.save).toHaveBeenCalledWith(newAccount);
      expect(result).toEqual(tokens);
    });

    it('should return tokens if account exists by provider and providerUserId', async () => {
      const existingAccount = { ...profile, verified: true } as AuthAccount;

      accountRepo.findOne.mockResolvedValue(existingAccount);
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue(tokens);

      const result = await service.loginOAuth(profile, 'browser');

      expect(accountRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ lastLoginAt: expect.any(Date) }),
      );

      expect(result).toEqual(tokens);
    });

    it('should associate new account with existing user by verified email', async () => {
      const user = { id: 'user-id' };
      const existingAccount = { ...profile, verified: true, user } as AuthAccount;

      accountRepo.findOne.mockResolvedValueOnce(null);
      accountRepo.findOne.mockResolvedValueOnce(existingAccount);
      accountRepo.create.mockReturnValue(existingAccount);

      jest.spyOn(service as any, 'generateTokens').mockResolvedValue(tokens);

      const result = await service.loginOAuth(profile, 'api');

      expect(accountRepo.create).toHaveBeenCalledWith(expect.objectContaining({ user }));
      expect(result).toEqual(tokens);
    });

    it('should not associate if existingByEmail has no user', async () => {
      const existingAccount = { ...profile, verified: true } as AuthAccount;

      accountRepo.findOne.mockResolvedValueOnce(null);
      accountRepo.findOne.mockResolvedValueOnce(existingAccount);
      accountRepo.create.mockReturnValue(existingAccount);

      jest.spyOn(service as any, 'generateTokens').mockResolvedValue(tokens);

      const result = await service.loginOAuth(profile, 'watch');

      expect(accountRepo.create).toHaveBeenCalledWith(
        expect.not.objectContaining({ user: expect.anything() }),
      );
      expect(result).toEqual(tokens);
    });

    it('should not associate if existingByEmail is unverified', async () => {
      const user = { id: 'user-id' };
      const existingAccount = { ...profile, verified: false, user } as AuthAccount;

      accountRepo.findOne.mockResolvedValueOnce(null);
      accountRepo.findOne.mockResolvedValueOnce(existingAccount);
      accountRepo.create.mockReturnValue({ ...profile, verified: true } as AuthAccount);

      jest.spyOn(service as any, 'generateTokens').mockResolvedValue(tokens);

      const result = await service.loginOAuth(profile, 'unverified');

      expect(accountRepo.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ user: existingAccount.user }),
      );

      expect(result).toEqual(tokens);
    });

    it('should still work if email is missing (ex: GitHub without public email)', async () => {
      const profileNoEmail = { ...profile, email: undefined };

      accountRepo.findOne.mockResolvedValueOnce(null);
      accountRepo.create.mockReturnValue({ ...profileNoEmail, verified: true } as AuthAccount);

      jest.spyOn(service as any, 'generateTokens').mockResolvedValue(tokens);

      const result = await service.loginOAuth(profileNoEmail, 'fallback');

      expect(accountRepo.create).toHaveBeenCalledWith(
        expect.not.objectContaining({ email: expect.any(String) }),
      );

      expect(result).toEqual(tokens);
    });

    it('should throw if save fails', async () => {
      accountRepo.findOne.mockResolvedValueOnce(null);
      accountRepo.findOne.mockResolvedValueOnce(null);
      accountRepo.create.mockReturnValue({ ...profile, verified: true } as AuthAccount);
      accountRepo.save.mockRejectedValue(new Error('DB failure'));

      await expect(service.loginOAuth(profile)).rejects.toThrow('DB failure');
    });
  });

  describe('signout', () => {
    it('should delete refresh token', async () => {
      await service.signout('acc-id', 'web');
      expect(tokenRepo.delete).toHaveBeenCalledWith({ account: { id: 'acc-id' }, device: 'web' });
    });
  });

  describe('generateTokens', () => {
    it('should call tokenFactory and persist token record', async () => {
      const tokens = { accessToken: 'a', refreshToken: 'b' };

      const tokenRecord = {
        account,
        device: 'default',
        refreshTokenHash: 'hashed',
      } as AuthToken;

      tokenFactory.generateTokens.mockResolvedValue({ ...tokens, tokenRecord });
      tokenRepo.create.mockReturnValue(tokenRecord);

      const result = await service.generateTokens(account);

      expect(result).toEqual(tokens);
      expect(tokenRepo.upsert).toHaveBeenCalledWith(tokenRecord, ['account', 'device']);
    });
  });
});
