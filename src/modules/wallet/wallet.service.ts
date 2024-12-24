import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { User } from '@modules/user/entities/user.entity'

import { CreateWalletDto } from './dtos/create-wallet.dto'
import { UpdateWalletDto } from './dtos/update-wallet.dto'
import { Wallet } from './entities/wallet.entity'

@Injectable()
export class WalletService {
    constructor(@InjectRepository(Wallet) private walletRepository: Repository<Wallet>) {}

    create(user: User, data: CreateWalletDto) {
        const wallet = this.walletRepository.create({ ...data, user })
        return this.walletRepository.save(wallet)
    }

    async update(id: string, user: User, data: UpdateWalletDto) {
        if (id && user) {
            const wallet = await this.walletRepository.findOneBy({ id, user })

            if (wallet) {
                Object.assign(wallet, data)
                return this.walletRepository.save(wallet)
            }
        }

        throw new NotFoundException()
    }

    async remove(id: string, user: User) {
        if (id && user) {
            const wallet = await this.walletRepository.findOneBy({ id, user })

            if (wallet) {
                return this.walletRepository.remove(wallet)
            }
        }

        throw new NotFoundException()
    }

    async findWallets(user: User): Promise<Wallet[]> {
        return user ? this.walletRepository.findBy({ user }) : []
    }
}
