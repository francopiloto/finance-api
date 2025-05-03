import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { ApiDefaultAuth } from '@decorators/api-default-auth.decorator';
import { CurrentUser } from '@modules/auth/decorators';

import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
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

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ description: 'User updated successfully.', type: User })
  @ApiNotFoundResponse({ description: 'User not found.' })
  update(@CurrentUser() user: User, @Body() data: UpdateUserDto) {
    return this.userService.update(user.id, data);
  }
}
