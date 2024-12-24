import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiNotFoundResponse } from '@nestjs/swagger'

import { ApiDefaultAuth } from '@decorators/api-default-auth.decorator'
import { CurrentUser } from '@modules/auth/decorators/user.decorator'
import { User } from '@modules/user/entities/user.entity'

import { CreateWalletDto } from './dtos/create-wallet.dto'
import { UpdateWalletDto } from './dtos/update-wallet.dto'
import { WalletService } from './wallet.service'

@Controller('wallet')
@ApiDefaultAuth()
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Post()
    createWallet(@CurrentUser() user: User, @Body() data: CreateWalletDto) {
        return this.walletService.create(user, data)
    }

    @Patch(':id')
    @ApiNotFoundResponse()
    updateWallet(@Param('id') id: string, @CurrentUser() user: User, @Body() data: UpdateWalletDto) {
        return this.walletService.update(id, user, data)
    }

    @Delete(':id')
    @ApiNotFoundResponse()
    removeWallet(@Param('id') id: string, @CurrentUser() user: User) {
        return this.walletService.remove(id, user)
    }

    @Get()
    listWallets(@CurrentUser() user: User) {
        return this.walletService.findWallets(user)
    }
}
