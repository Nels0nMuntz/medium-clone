import { DataSourceOptions } from 'typeorm';

const config: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'mediumclone',
  username: 'mediumclone',
  password: 'mediumclone',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
};

export default config;
