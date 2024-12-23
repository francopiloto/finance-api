import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger'

import { Credentials } from '@modules/auth/decorators/credentials.decorator'

import { CreateWalletDto } from './dtos/create-wallet.dto'
import { UpdateWalletDto } from './dtos/update-wallet.dto'
import { WalletService } from './wallet.service'

@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Post()
    @ApiUnauthorizedResponse()
    @ApiBearerAuth()
    createWallet(@Body() data: CreateWalletDto, @Credentials('id') userId: string) {
        return this.walletService.create(data, userId)
    }

    @Get()
    @ApiUnauthorizedResponse()
    @ApiBearerAuth()
    listWallets(@Credentials('id') userId: string) {
        return this.walletService.findAll(userId)
    }

    @Patch(':id')
    @ApiUnauthorizedResponse()
    @ApiBearerAuth()
    updateWallet(@Param('id') id: string, @Body() body: UpdateWalletDto) {
        return this.walletService.update(id, body)
    }

    @Delete('/:id')
    removeWallet(@Param('id') id: string) {
        return this.walletService.remove(id)
    }
}
