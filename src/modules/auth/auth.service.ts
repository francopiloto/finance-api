import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'

import { CreateUserDto } from '@modules/user/dtos/create-user.dto'
import { User } from '@modules/user/entities/user.entity'
import { UserService } from '@modules/user/user.service'

import { SignInUserDto } from './dtos/signin-user.dto'
import { Token } from './entities/token.entity'

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Token)
        private readonly tokenRepository: Repository<Token>,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async signUp(data: CreateUserDto) {
        if (await this.userService.findOneByEmail(data.email)) {
            throw new ConflictException('Email already in use')
        }

        const salt = await bcrypt.genSalt(10)
        const password = await bcrypt.hash(data.password, salt)

        return this.userService.create({ ...data, password })
    }

    async signIn({ email, password, appId }: SignInUserDto) {
        const user = await this.userService.findOneByEmail(email)

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new BadRequestException('Invalid credentials')
        }

        return this.createTokens(user, appId)
    }

    async createTokens(user: User, appId: string) {
        await this.tokenRepository.delete({ user, appId })

        const token = await this.tokenRepository.save(this.tokenRepository.create({ user, appId }))

        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync({ sub: user.id }, { expiresIn: this.configService.get('jwt.expiresIn') }),
            this.jwtService.signAsync(
                { sub: user.id, aud: appId, iss: token.id },
                { expiresIn: this.configService.get('jwt.refreshExpiresIn') }
            ),
        ])

        return { access_token, refresh_token }
    }

    async findRefreshToken(id: string) {
        return id ? this.tokenRepository.findOneBy({ id }) : null
    }
}
