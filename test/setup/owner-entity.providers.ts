import { DataSource } from 'typeorm';

import { OwnershipGuard } from '@modules/auth/guards/ownership.guard';

export const mockOwnershipProviders = [
  { provide: OwnershipGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
  { provide: DataSource, useValue: {} },
];
