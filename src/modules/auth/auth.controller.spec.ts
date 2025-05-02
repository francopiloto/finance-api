import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '@modules/user/entities/user.entity';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInUserDto } from './dtos/signin-user.dto';
import { SignUpUserDto } from './dtos/signup-user.dto';

const mockAuthService = () => ({
  signup: jest.fn(),
  signin: jest.fn(),
  signout: jest.fn(),
  generateTokens: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const user: User = { id: 'user-id' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useFactory: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  describe('signup', () => {
    it('should call service.signup with dto', async () => {
      const dto: SignUpUserDto = { name: 'John', email: 'john@example.com', password: '123456' };
      service.signup.mockResolvedValue(user);

      const result = await controller.signup(dto);

      expect(result).toEqual(user);
      expect(service.signup).toHaveBeenCalledWith(dto);
    });
  });

  describe('signin', () => {
    it('should call service.signin with dto', async () => {
      const dto: SignInUserDto = {
        email: 'john@example.com',
        password: '123456',
        device: 'mobile',
      };

      const expected = { accessToken: 'a', refreshToken: 'b' };
      service.signin.mockResolvedValue(expected);

      const result = await controller.signin(dto);

      expect(result).toEqual(expected);
      expect(service.signin).toHaveBeenCalledWith(dto);
    });

    it('should throw if service.signin throws', async () => {
      const dto = { email: 'wrong@example.com', password: 'bad', device: 'default' };
      service.signin.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.signin(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signout', () => {
    it('should call service.signout with user id and default device', async () => {
      await controller.signout('user-id', 'default');
      expect(service.signout).toHaveBeenCalledWith('user-id', 'default');
    });
  });

  describe('refresh', () => {
    it('should call service.generateTokens with user and default device on refresh', async () => {
      const resultMock = { accessToken: 'x', refreshToken: 'y' };
      service.generateTokens.mockResolvedValue(resultMock);

      const result = await controller.refresh(user, 'default');

      expect(result).toEqual(resultMock);
      expect(service.generateTokens).toHaveBeenCalledWith(user, 'default');
    });
  });
});
