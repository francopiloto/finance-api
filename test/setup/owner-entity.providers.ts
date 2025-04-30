import { DataSource } from 'typeorm';

import { IsOwnerGuard } from '@modules/auth/guards/owner.guard';

export const mockOwnerEntityProviders = [
  { provide: IsOwnerGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
  { provide: DataSource, useValue: {} },
];
