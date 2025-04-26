import { Test, TestingModule } from '@nestjs/testing';

import { ExpenseGroupController } from './expense-group.controller';

describe('ExpenseGroupController', () => {
  let controller: ExpenseGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseGroupController],
    }).compile();

    controller = module.get<ExpenseGroupController>(ExpenseGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
