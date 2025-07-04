import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ApiDefaultAuth } from '@decorators/api-default-auth.decorator';
import { CurrentUser } from '@modules/auth/decorators';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('users')
@ApiDefaultAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'User profile retrieved successfully.', type: User })
  @ApiNotFoundResponse({ description: 'User not found.' })
  getProfile(@CurrentUser() user: User) {
    return this.userService.findOneByIdOrFail(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user profile' })
  @ApiCreatedResponse({ description: 'User profile created successfully.', type: User })
  create(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ description: 'User updated successfully.', type: User })
  @ApiNotFoundResponse({ description: 'User not found.' })
  update(@CurrentUser() user: User, @Body() data: UpdateUserDto) {
    return this.userService.update(user.id, data);
  }
}
