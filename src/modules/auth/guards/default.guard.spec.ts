import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { DefaultAuthGuard } from './default.guard';

describe('DefaultAuthGuard', () => {
  let guard: DefaultAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new DefaultAuthGuard(reflector);
  });

  afterEach(() => jest.clearAllMocks());

  const mockContext = { getHandler: jest.fn(), getClass: jest.fn() } as unknown as ExecutionContext;

  it('should allow access if metadata disables guard', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should fallback to super.canActivate if not disabled', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    const superActivate = jest.fn().mockReturnValue(true);
    Object.setPrototypeOf(guard, { canActivate: superActivate });

    const result = guard.canActivate(mockContext);
    expect(superActivate).toHaveBeenCalledWith(mockContext);
    expect(result).toBe(true);
  });
});
