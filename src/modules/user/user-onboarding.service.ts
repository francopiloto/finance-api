import { ConflictException, Injectable } from '@nestjs/common';

import { DataSource, EntityManager } from 'typeorm';

import { AuthService } from '@modules/auth/auth.service';
import { AuthAccount } from '@modules/auth/entities/auth-account.entity';

import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserOnboardingService {
  constructor(
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
  ) {}

  async createUserAndAssignAccount(data: CreateUserDto, account: AuthAccount, device: string) {
    if (account.user) {
      throw new ConflictException('This account is already assigned to a user');
    }

    return this.dataSource.transaction(async (manager: EntityManager) => {
      const userRepo = manager.getRepository(User);
      const user = userRepo.create(data);

      await userRepo.save(user);

      return this.authService.assignUserToAccount(account, user, device, manager);
    });
  }
}
