import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { AuthProvider } from './auth.enums';
import { LoginLocalDto } from './dtos/login-local.dto';
import { RegisterLocalDto } from './dtos/register-local.dto';
import { AuthAccount } from './entities/auth-account.entity';
import { AuthToken } from './entities/token.entity';
import { TokenFactory } from './token/token.factory';
import { OAuthProfile } from './types/oauth';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthAccount)
    private readonly accountRepo: Repository<AuthAccount>,
    @InjectRepository(AuthToken)
    private readonly tokenRepo: Repository<AuthToken>,
    private readonly tokenFactory: TokenFactory,
  ) {}

  async registerLocal({ email, password, device = 'default' }: RegisterLocalDto) {
    const existing = await this.accountRepo.findOneBy({ provider: AuthProvider.LOCAL, email });

    if (existing) {
      throw new ConflictException('A local account with this email already exists');
    }

    const account = this.accountRepo.create({
      provider: AuthProvider.LOCAL,
      email,
      password: await bcrypt.hash(password, 10),
      verified: false,
    });

    // TODO: send verification email
    // const token = this.emailVerificationService.generateToken(email);
    // await this.emailService.sendVerification(email, token);

    await this.accountRepo.save(account);
    return this.generateTokens(account, device);
  }

  async loginLocal({ email, password, device = 'default' }: LoginLocalDto) {
    const account = await this.accountRepo.findOne({
      where: { provider: AuthProvider.LOCAL, email },
      relations: ['user'],
      select: ['id', 'email', 'password', 'verified'],
    });

    if (!account || !account.password || !(await bcrypt.compare(password, account.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!account.verified) {
      throw new ForbiddenException('Email verification required');
    }

    account.lastLoginAt = new Date();
    await this.accountRepo.save(account);

    return this.generateTokens(account, device);
  }

  async loginOAuth({ provider, providerUserId, email, avatarUrl }: OAuthProfile, device?: string) {
    let account = await this.accountRepo.findOne({
      where: [{ provider, providerUserId }, ...(email ? [{ provider, email }] : [])],
      relations: ['user'],
    });

    if (!account) {
      const existingByEmail = email
        ? await this.accountRepo.findOne({
            where: { email, verified: true },
            relations: ['user'],
          })
        : null;

      const shouldMergeProfiles = !!existingByEmail?.verified && !!existingByEmail?.user;

      account = this.accountRepo.create({
        provider,
        providerUserId,
        email,
        avatarUrl,
        verified: true,
        ...(shouldMergeProfiles && { user: existingByEmail.user }),
      });
    } else {
      account.lastLoginAt = new Date();
    }

    await this.accountRepo.save(account);
    return this.generateTokens(account, device);
  }

  async generateTokens(account: AuthAccount, device = 'default') {
    const { accessToken, refreshToken, tokenRecord } = await this.tokenFactory.generateTokens(
      account,
      device,
    );

    await this.tokenRepo.upsert(this.tokenRepo.create(tokenRecord), ['account', 'device']);
    return { accessToken, refreshToken };
  }

  async signout(accountId: string, device = 'default') {
    await this.tokenRepo.delete({ account: { id: accountId }, device });
  }
}
