import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserModule } from '@modules/user/user.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { Token } from './entities/token.entity'
import { DefaultAuthGuard } from './guards/default.guard'
import { JwtStrategy } from './strategies/jwt.strategy'
import { RefreshStrategy } from './strategies/refresh.strategy'

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('jwt.secret'),
                signOptions: { expiresIn: config.get('jwt.expiresIn') },
            }),
        }),
        TypeOrmModule.forFeature([Token]),
        UserModule,
    ],
    providers: [AuthService, JwtStrategy, RefreshStrategy, { provide: APP_GUARD, useClass: DefaultAuthGuard }],
    controllers: [AuthController],
})
export class AuthModule {}
