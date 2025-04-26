import { Test, TestingModule } from '@nestjs/testing';

import { ExpenseGroupService } from '../expense-group.service';

describe('ExpenseGroupService', () => {
  let service: ExpenseGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpenseGroupService],
    }).compile();

    service = module.get<ExpenseGroupService>(ExpenseGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
