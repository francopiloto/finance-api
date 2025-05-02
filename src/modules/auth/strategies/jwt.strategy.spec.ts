import { UnauthorizedException } from '@nestjs/common';

import { JwtStrategy } from './jwt.strategy';

const mockUserService = { findOneById: jest.fn() };

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy(
      { get: jest.fn().mockReturnValue('secret') } as any,
      mockUserService as any,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should return [user, { device }] if valid', async () => {
    const user = { id: 'id', name: 'John' };
    mockUserService.findOneById.mockResolvedValue(user);

    const result = await strategy.validate({ sub: 'id', aud: 'web' });
    expect(result).toEqual([user, { device: 'web' }]);
  });

  it('should throw if user not found', async () => {
    mockUserService.findOneById.mockResolvedValue(null);

    await expect(strategy.validate({ sub: 'id', aud: 'web' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
