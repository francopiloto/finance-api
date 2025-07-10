import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  findAll() {
    return this.userRepo.find();
  }

  findOneById(id: string) {
    return id ? this.userRepo.findOneBy({ id }) : Promise.resolve(null);
  }

  async findOneByIdOrFail(id: string) {
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  findOneByEmail(email: string) {
    return email ? this.userRepo.findOneBy({ email }) : Promise.resolve(null);
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findOneByIdOrFail(id);

    Object.assign(user, data);
    return this.userRepo.save(user);
  }
}
