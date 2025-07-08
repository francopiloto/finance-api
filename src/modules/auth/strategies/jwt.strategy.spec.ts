import { UnauthorizedException } from '@nestjs/common';

import { JwtStrategy } from './jwt.strategy';

const mockAccountRepo = { findOne: jest.fn() };
const mockConfig = { get: jest.fn().mockReturnValue('secret') };

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy(mockConfig as any, mockAccountRepo as any);
  });

  afterEach(() => jest.clearAllMocks());

  it('should return [user, { account, device }] if valid', async () => {
    const mockUser = { id: 'user-id', name: 'John' };
    const mockAccount = { id: 'acc-id', user: mockUser };

    mockAccountRepo.findOne.mockResolvedValue(mockAccount);

    const result = await strategy.validate({ sub: 'acc-id', aud: 'web' });

    expect(result).toEqual([mockUser, { account: mockAccount, device: 'web' }]);

    expect(mockAccountRepo.findOne).toHaveBeenCalledWith({
      where: { id: 'acc-id' },
      relations: ['user'],
    });
  });

  it('should return [null, { account, device }] if account has no user', async () => {
    const mockAccount = { id: 'acc-id', user: null };
    mockAccountRepo.findOne.mockResolvedValue(mockAccount);

    const result = await strategy.validate({ sub: 'acc-id', aud: 'web' });

    expect(result).toEqual([null, { account: mockAccount, device: 'web' }]);
  });

  it('should throw if user not found', async () => {
    mockAccountRepo.findOne.mockResolvedValue(null);

    await expect(strategy.validate({ sub: 'invalid-id', aud: 'web' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
