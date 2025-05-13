import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { UserService } from '@modules/user/user.service';

import { AuthStrategyName } from '../auth.constants';
import { AuthToken } from '../entities/token.entity';
import { TokenFactory } from '../token/token.factory';
import { jwtFromRequest } from '../token/token.utils';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, AuthStrategyName.REFRESH_JWT) {
  constructor(
    readonly configService: ConfigService,

    @InjectRepository(AuthToken)
    private readonly tokenRepo: Repository<AuthToken>,
    private readonly userService: UserService,
    private readonly tokenFactory: TokenFactory,
  ) {
    super({
      jwtFromRequest,
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.get('jwt.refreshSecret') || configService.get('jwt.secret'),
    });
  }

  async validate(req: Request, { sub: userId, aud: device }: { sub: string; aud: string }) {
    const refreshToken = jwtFromRequest(req);

    const [user, token] = await Promise.all([
      this.userService.findOneById(userId),
      this.tokenRepo.findOne({
        where: { user: { id: userId }, device },
        select: ['id', 'refreshTokenHash'],
      }),
    ]);

    if (
      user &&
      token &&
      refreshToken &&
      token.refreshTokenHash === this.tokenFactory.hashToken(refreshToken)
    ) {
      return [user, { device }];
    }

    throw new UnauthorizedException('Invalid refresh token');
  }
}
