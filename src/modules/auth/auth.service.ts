import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/user.service';

import { SignInUserDto } from './dtos/signin-user.dto';
import { SignUpUserDto } from './dtos/signup-user.dto';
import { AuthToken } from './entities/token.entity';
import { TokenFactory } from './token/token.factory';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthToken)
    private readonly tokenRepo: Repository<AuthToken>,
    private readonly tokenFactory: TokenFactory,
    private readonly userService: UserService,
  ) {}

  async signup(data: SignUpUserDto): Promise<User> {
    const existing = await this.userService.findOneByEmail(data.email);

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hash = await bcrypt.hash(data.password, 10);
    return this.userService.create({ ...data, password: hash });
  }

  async signin({ email, password, device }: SignInUserDto) {
    const user = await this.userService.findOneByEmailWithPassword(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user, device);
  }

  async signout(userId: string, device: string): Promise<void> {
    await this.tokenRepo.delete({ user: { id: userId }, device });
  }

  async generateTokens(user: User, device: string = 'default') {
    const { accessToken, refreshToken, tokenRecord } = await this.tokenFactory.generateTokens(
      user,
      device,
    );

    await this.tokenRepo.upsert(this.tokenRepo.create(tokenRecord), ['user', 'device']);
    return { accessToken, refreshToken };
  }
}
