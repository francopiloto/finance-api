import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiNotFoundResponse, ApiUnauthorizedResponse } from '@nestjs/swagger'

import { CurrentUser } from '@modules/auth/decorators/user.decorator'
import { User } from '@modules/user/entities/user.entity'

import { CreateWalletDto } from './dtos/create-wallet.dto'
import { UpdateWalletDto } from './dtos/update-wallet.dto'
import { WalletService } from './wallet.service'

@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Post()
    @ApiUnauthorizedResponse()
    @ApiBearerAuth()
    createWallet(@CurrentUser() user: User, @Body() data: CreateWalletDto) {
        return this.walletService.create(user, data)
    }

    @Patch(':id')
    @ApiUnauthorizedResponse()
    @ApiNotFoundResponse()
    @ApiBearerAuth()
    updateWallet(@Param('id') id: string, @CurrentUser() user: User, @Body() data: UpdateWalletDto) {
        return this.walletService.update(id, user, data)
    }

    @Delete(':id')
    @ApiUnauthorizedResponse()
    @ApiNotFoundResponse()
    @ApiBearerAuth()
    removeWallet(@Param('id') id: string, @CurrentUser() user: User) {
        return this.walletService.remove(id, user)
    }

    @Get()
    @ApiUnauthorizedResponse()
    @ApiNotFoundResponse()
    @ApiBearerAuth()
    listWallets(@CurrentUser() user: User) {
        return this.walletService.findWallets(user)
    }
}
