import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

import { CreateUserDto } from '@modules/user/dtos/create-user.dto'
import { UserService } from '@modules/user/user.service'

import { SignInUserDto } from './dtos/signin-user.dto'

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async signUp(data: CreateUserDto) {
        if (await this.userService.findOneByEmail(data.email)) {
            throw new ConflictException('Email already in use')
        }

        const salt = await bcrypt.genSalt(10)
        const password = await bcrypt.hash(data.password, salt)

        return this.userService.create({ ...data, password })
    }

    async signIn({ email, password }: SignInUserDto) {
        const user = await this.userService.findOneByEmail(email)

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new BadRequestException('Invalid credentials')
        }

        return {
            access_token: await this.jwtService.signAsync({ sub: user.id }),
        }
    }
}
