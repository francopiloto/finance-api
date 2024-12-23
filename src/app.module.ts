import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'

import { appConfig } from './app.config'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'

@Module({
    imports: [
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.get('typeorm') || {},
        }),
        UserModule,
    ],
    providers: [
        { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true }) },
        { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    ],
})
export class AppModule {}
