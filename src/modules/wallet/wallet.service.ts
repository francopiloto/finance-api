import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';
import { fk } from '@utils/db';

import { CreateWalletDto } from './dtos/create-wallet.dto';
import { UpdateWalletDto } from './dtos/update-wallet.dto';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletService {
  constructor(@InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>) {}

  async findAll(user: User): Promise<Wallet[]> {
    return user ? this.walletRepo.find({ where: { user: fk(user) }, order: { name: 'ASC' } }) : [];
  }

  async findOneByIdOrFail(user: User, id: string) {
    const wallet =
      user && id ? await this.walletRepo.findOne({ where: { id, user: fk(user) } }) : null;

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  create(user: User, data: CreateWalletDto) {
    const wallet = this.walletRepo.create({ ...data, user });
    return this.walletRepo.save(wallet);
  }

  async update(user: User, id: string, data: UpdateWalletDto) {
    const wallet = await this.findOneByIdOrFail(user, id);

    Object.assign(wallet, data);
    return this.walletRepo.save(wallet);
  }

  async remove(user: User, id: string) {
    const wallet = await this.findOneByIdOrFail(user, id);
    return this.walletRepo.remove(wallet);
  }
}
