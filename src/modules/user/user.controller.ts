import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ApiDefaultAuth } from '@decorators/api-default-auth.decorator';
import { CurrentAuthAccount, CurrentAuthInfo, CurrentUser } from '@modules/auth/decorators';
import { AuthAccount } from '@modules/auth/entities/auth-account.entity';
import { VerifiedAccountGuard } from '@modules/auth/guards/verified.guard';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';
import { UserOnboardingService } from './user-onboarding.service';
import { UserService } from './user.service';

@Controller('users')
@ApiDefaultAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userOnboardingService: UserOnboardingService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'User profile retrieved successfully.', type: User })
  @ApiNotFoundResponse({ description: 'User not found.' })
  getProfile(@CurrentUser() user: User) {
    return this.userService.findOneByIdOrFail(user.id);
  }

  @Post()
  @UseGuards(VerifiedAccountGuard)
  @ApiOperation({ summary: 'Create user profile' })
  @ApiCreatedResponse({ description: 'User profile created successfully.', type: User })
  create(
    @Body() data: CreateUserDto,
    @CurrentAuthAccount() account: AuthAccount,
    @CurrentAuthInfo('device') device: string,
  ) {
    return this.userOnboardingService.createUserAndAssignAccount(data, account, device);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ description: 'User updated successfully.', type: User })
  @ApiNotFoundResponse({ description: 'User not found.' })
  update(@CurrentUser() user: User, @Body() data: UpdateUserDto) {
    return this.userService.update(user.id, data);
  }
}
