import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config({ path: `.env.${process.env.NODE_ENV || 'dev'}` });

const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  migrationsRun: false,
  logging: process.env.NODE_ENV !== 'production',
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
      secret: process.env.AUTH_JWT_SECRET,
      expiresIn: process.env.AUTH_JWT_EXPIRES_IN || '1h',
      refreshExpiresIn: process.env.AUTH_JWT_REFRESH_EXPIRES_IN || '1d',
    },
  };
}
