import { Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

interface DbConfig {
  development: {
    username: string;
    password: string;
    database: string;
    host: string;
    dialect: Dialect;
    port: number;
    logging: boolean
  };
}

const config: DbConfig = {
  development: {
    username: process.env.ORDER_DB_USER || 'root',
    password: process.env.ORDER_DB_PASSWORD || 'password',
    database: process.env.ORDER_DB_NAME || 'order-db',
    host: process.env.ORDER_DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    port: Number(process.env.ORDER_DB_PORT) || 3307,
    logging: false
  },
};

export default config;
