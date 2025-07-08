import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { fk } from '@utils/db';

import { AuthStrategyName } from '../auth.enums';
import { AuthAccount } from '../entities/auth-account.entity';
import { AuthToken } from '../entities/token.entity';
import { TokenFactory } from '../token/token.factory';
import { jwtFromRequest } from '../token/token.utils';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, AuthStrategyName.REFRESH_JWT) {
  constructor(
    readonly configService: ConfigService,
    @InjectRepository(AuthAccount)
    private readonly accountRepo: Repository<AuthAccount>,
    @InjectRepository(AuthToken)
    private readonly tokenRepo: Repository<AuthToken>,
    private readonly tokenFactory: TokenFactory,
  ) {
    super({
      jwtFromRequest,
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.get('jwt.refreshSecret') || configService.get('jwt.secret'),
    });
  }

  async validate(req: Request, { sub: accountId, aud: device }: { sub: string; aud: string }) {
    const refreshToken = jwtFromRequest(req);

    const [account, token] = await Promise.all([
      this.accountRepo.findOne({ where: fk(accountId), relations: ['user'] }),
      this.tokenRepo.findOne({
        where: { account: fk(accountId), device },
        select: ['id', 'refreshTokenHash'],
      }),
    ]);

    if (
      account &&
      token &&
      refreshToken &&
      token.refreshTokenHash === this.tokenFactory.hashToken(refreshToken)
    ) {
      return [account.user ?? null, { account, device }];
    }

    throw new UnauthorizedException('Invalid refresh token');
  }
}
