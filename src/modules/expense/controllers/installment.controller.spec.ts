import { Test, TestingModule } from '@nestjs/testing';

import { InstallmentController } from './installment.controller';

describe('InstallmentController', () => {
  let controller: InstallmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstallmentController],
    }).compile();

    controller = module.get<InstallmentController>(InstallmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
