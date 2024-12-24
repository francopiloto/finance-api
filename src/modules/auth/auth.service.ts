import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'

import { User } from '@modules/user/entities/user.entity'

import { SignInUserDto } from './dtos/signin-user.dto'
import { SignUpUserDto } from './dtos/signup-user.dto'
import { Token } from './entities/token.entity'

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Token)
        private readonly tokenRepository: Repository<Token>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async signUp(data: SignUpUserDto) {
        if (await this.userRepository.existsBy({ email: data.email })) {
            throw new ConflictException('Email already in use')
        }

        const salt = await bcrypt.genSalt(10)
        const password = await bcrypt.hash(data.password, salt)

        const user = this.userRepository.create({ ...data, password })
        return this.userRepository.save(user)
    }

    async signIn({ email, password, appId }: SignInUserDto) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .select('user')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne()

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
