import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.enums';
import { AuthService } from './auth.service';
import { LoginLocalDto } from './dtos/login-local.dto';
import { RegisterLocalDto } from './dtos/register-local.dto';
import { AuthAccount } from './entities/auth-account.entity';
import { OAuthProfile } from './types/oauth';

const mockAuthService = () => ({
  registerLocal: jest.fn(),
  loginLocal: jest.fn(),
  loginOAuth: jest.fn(),
  signout: jest.fn(),
  generateTokens: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const account: AuthAccount = { id: 'account-id' } as AuthAccount;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useFactory: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  describe('signup', () => {
    it('should call service.registerLocal with dto', async () => {
      const dto: RegisterLocalDto = { email: 'john@example.com', password: '123456' };
      const tokens = { accessToken: 'a', refreshToken: 'b' };

      service.registerLocal.mockResolvedValue(tokens);

      const result = await controller.signup(dto);

      expect(result).toEqual(tokens);
      expect(service.registerLocal).toHaveBeenCalledWith(dto);
    });
  });

  describe('signin', () => {
    it('should call service.loginLocal with dto', async () => {
      const dto: LoginLocalDto = {
        email: 'john@example.com',
        password: '123456',
        device: 'mobile',
      };

      const expected = { accessToken: 'a', refreshToken: 'b' };
      service.loginLocal.mockResolvedValue(expected);

      const result = await controller.signin(dto);

      expect(result).toEqual(expected);
      expect(service.loginLocal).toHaveBeenCalledWith(dto);
    });

    it('should throw if service.loginLocal throws', async () => {
      const dto = { email: 'wrong@example.com', password: 'bad', device: 'default' };
      service.loginLocal.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.signin(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signout', () => {
    it('should call service.signout with account id and default device', async () => {
      await controller.signout('account-id', 'web');
      expect(service.signout).toHaveBeenCalledWith('account-id', 'web');
    });
  });

  describe('refresh', () => {
    it('should call service.generateTokens with account and device', async () => {
      const tokens = { accessToken: 'x', refreshToken: 'y' };
      service.generateTokens.mockResolvedValue(tokens);

      const result = await controller.refresh(account, 'web');

      expect(result).toEqual(tokens);
      expect(service.generateTokens).toHaveBeenCalledWith(account, 'web');
    });
  });

  describe('googleCallback', () => {
    it('should call service.loginOAuth with profile and device', async () => {
      const profile: OAuthProfile = {
        provider: AuthProvider.GOOGLE,
        providerUserId: 'google-123',
        email: 'user@example.com',
        avatarUrl: 'url',
      };

      const tokens = { accessToken: 'a', refreshToken: 'b' };

      service.loginOAuth.mockResolvedValue(tokens);

      const result = await controller.googleCallback(profile, 'mobile');

      expect(result).toEqual(tokens);
      expect(service.loginOAuth).toHaveBeenCalledWith(profile, 'mobile');
    });
  });
});
