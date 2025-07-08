import { UnauthorizedException } from '@nestjs/common';

import { Request } from 'express';

import { RefreshTokenStrategy } from './jwt-refresh.strategy';

const mockAccountRepo = { findOne: jest.fn() };
const mockTokenRepo = { findOne: jest.fn() };
const mockTokenFactory = { hashToken: jest.fn() };

describe('RefreshTokenStrategy', () => {
  let strategy: RefreshTokenStrategy;

  const accountId = 'acc-id';
  const device = 'web';
  const payload = { sub: accountId, aud: device };

  const mockReq = (token: string) => ({ headers: { authorization: `Bearer ${token}` } }) as Request;

  beforeEach(() => {
    strategy = new RefreshTokenStrategy(
      { get: jest.fn().mockReturnValue('secret') } as any,
      mockAccountRepo as any,
      mockTokenRepo as any,
      mockTokenFactory as any,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should return [user, { account, device }] on valid refresh token', async () => {
    const mockUser = { id: 'user-id' };
    const mockAccount = { id: accountId, user: mockUser };
    const hashedToken = 'expected';

    mockAccountRepo.findOne.mockResolvedValue(mockAccount);
    mockTokenRepo.findOne.mockResolvedValue({ refreshTokenHash: hashedToken });
    mockTokenFactory.hashToken.mockReturnValue(hashedToken);

    const result = await strategy.validate(mockReq('raw-token'), payload);

    expect(result).toEqual([mockUser, { account: mockAccount, device }]);

    expect(mockAccountRepo.findOne).toHaveBeenCalledWith({
      where: { id: accountId },
      relations: ['user'],
    });

    expect(mockTokenRepo.findOne).toHaveBeenCalledWith({
      where: { account: { id: accountId }, device },
      select: ['id', 'refreshTokenHash'],
    });
  });

  it('should return [null, { account, device }] if account has no user', async () => {
    const mockAccount = { id: accountId, user: null };
    const hashedToken = 'expected';

    mockAccountRepo.findOne.mockResolvedValue(mockAccount);
    mockTokenRepo.findOne.mockResolvedValue({ refreshTokenHash: hashedToken });
    mockTokenFactory.hashToken.mockReturnValue(hashedToken);

    const result = await strategy.validate(mockReq('raw-token'), payload);

    expect(result).toEqual([null, { account: mockAccount, device }]);
  });

  it('should throw if account not found', async () => {
    mockAccountRepo.findOne.mockResolvedValue(null);
    await expect(strategy.validate(mockReq('abc'), payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if token not found', async () => {
    mockAccountRepo.findOne.mockResolvedValue({ id: accountId, user: null });
    mockTokenRepo.findOne.mockResolvedValue(null);

    await expect(strategy.validate(mockReq('abc'), payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if token hash does not match', async () => {
    const mockAccount = { id: accountId, user: null };

    mockAccountRepo.findOne.mockResolvedValue(mockAccount);
    mockTokenRepo.findOne.mockResolvedValue({ refreshTokenHash: 'wrong' });
    mockTokenFactory.hashToken.mockReturnValue('expected');

    await expect(strategy.validate(mockReq('abc'), payload)).rejects.toThrow(UnauthorizedException);
  });
});
