import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateWalletDto } from './dtos/create-wallet.dto'
import { UpdateWalletDto } from './dtos/update-wallet.dto'
import { Wallet } from './entities/wallet.entity'

@Injectable()
export class WalletService {
    constructor(@InjectRepository(Wallet) private walletRepository: Repository<Wallet>) {}

    create(data: CreateWalletDto, userId: string) {
        const wallet = this.walletRepository.create({ ...data, owner: { id: userId } })
        return this.walletRepository.save(wallet)
    }

    findAll(userId: string) {
        return this.walletRepository.findBy({ owner: { id: userId } })
    }

    async update(id: string, data: UpdateWalletDto) {
        const wallet = await this.walletRepository.findOneBy({ id })

        if (!wallet) {
            throw new NotFoundException()
        }

        Object.assign(wallet, data)
        return this.walletRepository.save(wallet)
    }

    async remove(id: string) {
        const wallet = await this.walletRepository.findOneBy({ id })

        if (!wallet) {
            throw new NotFoundException()
        }

        this.walletRepository.remove(wallet)
    }
}
