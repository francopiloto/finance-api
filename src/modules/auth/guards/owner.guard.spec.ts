import { ExecutionContext, NotFoundException } from '@nestjs/common';

import { User } from '@modules/user/entities/user.entity';

import { ResourceOwnerGuard } from './owner.guard';

const mockReflector = { get: jest.fn() };
const mockRepo = { findOne: jest.fn() };
const mockDataSource = { getRepository: jest.fn().mockReturnValue(mockRepo) };

describe('ResourceOwnerGuard', () => {
  let guard: ResourceOwnerGuard;

  const user: User = { id: 'user-id' } as User;

  beforeEach(() => {
    guard = new ResourceOwnerGuard(mockReflector as any, mockDataSource as any);
    jest.clearAllMocks();
  });

  const mockContext = (params?: object) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user, params }) }),
      getHandler: jest.fn(),
    }) as unknown as ExecutionContext;

  it('should allow if no entity metadata is set', async () => {
    mockReflector.get.mockReturnValueOnce(null);

    const result = await guard.canActivate(mockContext({ id: '123' }));
    expect(result).toBe(true);
  });

  it('should throw if no resourceId is found in params or body', async () => {
    mockReflector.get.mockReturnValueOnce('Entity');
    mockReflector.get.mockReturnValueOnce('id');

    await expect(guard.canActivate(mockContext())).rejects.toThrow(NotFoundException);
  });

  it('should throw if resource not found or not owned', async () => {
    mockReflector.get.mockReturnValueOnce('Entity');
    mockReflector.get.mockReturnValueOnce('id');
    mockRepo.findOne.mockResolvedValue(null);

    await expect(guard.canActivate(mockContext({ id: '123' }))).rejects.toThrow(NotFoundException);
  });

  it('should return true if user owns the resource', async () => {
    mockReflector.get.mockReturnValueOnce('Entity');
    mockReflector.get.mockReturnValueOnce('id');
    mockRepo.findOne.mockResolvedValue({ id: '123', user });

    const result = await guard.canActivate(mockContext({ id: '123' }));
    expect(result).toBe(true);
  });
});
