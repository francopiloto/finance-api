import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy } from 'passport-jwt'

import { UserService } from '@modules/user/user.service'

import { AuthStrategyName } from '../auth.constants'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AuthStrategyName.JWT) {
    constructor(
        private readonly userService: UserService,
        configService: ConfigService
    ) {
        super({
            jwtFromRequest: (req: Request) => req.headers?.authorization?.replace(/bearer\s+/i, ''),
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt.secret'),
        })
    }

    async validate(payload: { sub: string }) {
        const user = await this.userService.findOneById(payload.sub)

        if (!user) {
            throw new UnauthorizedException()
        }

        return user
    }
}
