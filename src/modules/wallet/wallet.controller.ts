import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ApiDefaultAuth } from '@decorators/api-default-auth.decorator';
import { CheckOwnership, CurrentUser } from '@modules/auth/decorators';
import { User } from '@modules/user/entities/user.entity';

import { CreateWalletDto } from './dtos/create-wallet.dto';
import { UpdateWalletDto } from './dtos/update-wallet.dto';
import { Wallet } from './entities/wallet.entity';
import { WalletService } from './wallet.service';

@Controller('wallet')
@ApiDefaultAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'List all wallets for the authenticated user' })
  @ApiOkResponse({ description: 'Wallets retrieved successfully', type: [Wallet] })
  findAll(@CurrentUser() user: User) {
    return this.walletService.findAll(user);
  }

  @Get(':id')
  @CheckOwnership(Wallet)
  @ApiOperation({ summary: 'Retrieve a specific wallet by ID' })
  @ApiOkResponse({ description: 'Wallet retrieved successfully', type: Wallet })
  @ApiNotFoundResponse({ description: 'Wallet not found' })
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.walletService.findOneByIdOrFail(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiCreatedResponse({ description: 'Wallet created successfully', type: Wallet })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  create(@CurrentUser() user: User, @Body() dto: CreateWalletDto) {
    return this.walletService.create(user, dto);
  }

  @Patch(':id')
  @CheckOwnership(Wallet)
  @ApiOperation({ summary: 'Update an existing wallet' })
  @ApiOkResponse({ description: 'Wallet updated successfully', type: Wallet })
  @ApiNotFoundResponse({ description: 'Wallet not found' })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWalletDto,
  ) {
    return this.walletService.update(user, id, dto);
  }

  @Delete(':id')
  @CheckOwnership(Wallet)
  @ApiOperation({ summary: 'Delete a wallet' })
  @ApiOkResponse({ description: 'Wallet deleted successfully' })
  @ApiNotFoundResponse({ description: 'Wallet not found' })
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.walletService.remove(user, id);
  }
}
