import { INestApplication, Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'

function configureSwagger(app: INestApplication) {
    const config = new DocumentBuilder().setTitle('Invest API').setVersion('1.0').addBearerAuth().build()
    const documentFactory = () => SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, documentFactory)
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    if (process.env.NODE_ENV === 'dev') {
        configureSwagger(app)
    }

    await app.listen(process.env.PORT ?? 4000)
    Logger.log(`Application is running on: ${await app.getUrl()}`)
}

bootstrap()
