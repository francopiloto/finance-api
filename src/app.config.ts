import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config({ path: `.env.${process.env.NODE_ENV}` });

const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [`**/*.entity.${process.env.NODE_ENV === 'test' ? 'ts' : 'js'}`],
  migrations: ['migrations/*.js'],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: true,
};

export const dataSource = new DataSource(typeormConfig);

export async function appConfig() {
  /** Access external services here to fetch protected configurations */

  return {
    node: {
      env: process.env.NODE_ENV,
    },
    typeorm: typeormConfig,
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '1d',
    },
  };
}
