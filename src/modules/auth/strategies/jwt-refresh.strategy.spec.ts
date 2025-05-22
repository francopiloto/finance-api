import { UnauthorizedException } from '@nestjs/common';

import { Request } from 'express';

import { RefreshTokenStrategy } from './jwt-refresh.strategy';

const mockUserService = { findOneById: jest.fn() };
const mockTokenRepo = { findOne: jest.fn() };
const mockTokenFactory = { hashToken: jest.fn() };

describe('RefreshTokenStrategy', () => {
  let strategy: RefreshTokenStrategy;

  const user = { id: 'id' };
  const payload = { sub: 'id', aud: 'device' };

  const mockReq = (token: string) => ({ headers: { authorization: `Bearer ${token}` } }) as Request;

  beforeEach(() => {
    strategy = new RefreshTokenStrategy(
      { get: jest.fn().mockReturnValue('secret') } as any,
      mockTokenRepo as any,
      mockUserService as any,
      mockTokenFactory as any,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should return [user, { device }] on valid token', async () => {
    mockUserService.findOneById.mockResolvedValue(user);
    mockTokenRepo.findOne.mockResolvedValue({ refreshTokenHash: 'expected' });
    mockTokenFactory.hashToken.mockReturnValue('expected');

    const result = await strategy.validate(mockReq('abc'), payload);
    expect(result).toEqual([user, { device: 'device' }]);
  });

  it('should throw if user not found', async () => {
    mockUserService.findOneById.mockResolvedValue(null);
    await expect(strategy.validate(mockReq('abc'), payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if token not found', async () => {
    mockUserService.findOneById.mockResolvedValue(user);
    mockTokenRepo.findOne.mockResolvedValue(null);

    await expect(strategy.validate(mockReq('abc'), payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if token hash does not match', async () => {
    mockUserService.findOneById.mockResolvedValue(user);
    mockTokenRepo.findOne.mockResolvedValue({ refreshTokenHash: 'wrong' });
    mockTokenFactory.hashToken.mockReturnValue('expected');

    await expect(strategy.validate(mockReq('abc'), payload)).rejects.toThrow(UnauthorizedException);
  });
});
