import { config } from 'dotenv'
import { DataSource, DataSourceOptions } from 'typeorm'

config({ path: `.env.${process.env.NODE_ENV}` })

const typeormConfig: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [`**/*.entity.${process.env.NODE_ENV === 'test' ? 'ts' : 'js'}`],
    migrations: ['migrations/*.js'],
    synchronize: false,
}

export const dataSource = new DataSource(typeormConfig)

export async function appConfig() {
    /** Access external services here to fetch protected configurations */

    return {
        node: {
            env: process.env.NODE_ENV,
        },
        typeorm: typeormConfig,
        jwt: {
            secret: process.env.JWT_SECRET,
        },
    }
}
