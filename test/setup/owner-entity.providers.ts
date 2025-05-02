import { DataSource } from 'typeorm';

import { ResourceOwnerGuard } from '@modules/auth/guards/owner.guard';

export const mockOwnerEntityProviders = [
  { provide: ResourceOwnerGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
  { provide: DataSource, useValue: {} },
];
