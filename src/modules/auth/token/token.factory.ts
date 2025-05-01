import * as crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { addDays } from 'date-fns';

import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class TokenFactory {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(user: User, device: string) {
    const payload = { sub: user.id, aud: device };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: this.configService.get('jwt.expiresIn') }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ]);

    const tokenRecord = {
      user,
      device,
      refreshTokenHash: this.hashToken(refreshToken),
      expiresAt: addDays(new Date(), 7),
    };

    return { accessToken, refreshToken, tokenRecord };
  }

  hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
