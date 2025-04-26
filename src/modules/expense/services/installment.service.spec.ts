import { Test, TestingModule } from '@nestjs/testing';

import { InstallmentService } from './installment.service';

describe('InstallmentService', () => {
  let service: InstallmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstallmentService],
    }).compile();

    service = module.get<InstallmentService>(InstallmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
