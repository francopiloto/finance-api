import { Body, Controller, Delete, Get, NotFoundException, Param, Patch } from '@nestjs/common'

import { UpdateUserDto } from './dtos/update-user.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    findAll() {
        return this.userService.findAll()
    }

    @Get(':id')
    findUser(@Param('id') id: string) {
        const user = this.userService.findOneById(id)

        if (!user) {
            throw new NotFoundException()
        }

        return user
    }

    @Delete(':id')
    removeUser(@Param('id') id: string) {
        return this.userService.remove(id)
    }

    @Patch(':id')
    updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
        return this.userService.update(id, data)
    }
}
