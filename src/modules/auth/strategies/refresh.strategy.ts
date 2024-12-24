import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy } from 'passport-jwt'

import { UserService } from '@modules/user/user.service'

import { AuthStrategyName } from '../auth.constants'
import { AuthService } from '../auth.service'

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, AuthStrategyName.REFRESH) {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        configService: ConfigService
    ) {
        super({
            jwtFromRequest: (req: Request) => req.headers?.authorization?.replace(/bearer\s+/i, ''),
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt.secret'),
        })
    }

    async validate(payload: { sub: string; aud: string; iss: string }) {
        const [user, token] = await Promise.all([
            this.userService.findOneById(payload.sub),
            this.authService.findRefreshToken(payload.iss),
        ])

        if (user && token && payload.aud) {
            return [user, { appId: payload.aud }]
        }

        throw new UnauthorizedException()
    }
}
