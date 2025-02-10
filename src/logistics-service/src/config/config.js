require('dotenv').config();

module.exports = {
  development: {
    database: process.env.LOGISTICS_DB_NAME || 'logistics-db',
    username: process.env.LOGISTICS_DB_USER || 'root',
    password: process.env.LOGISTICS_DB_PASSWORD || 'password',
    host: process.env.LOGISTICS_DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    port: Number(process.env.LOGISTICS_DB_PORT),
    logging: false
  },
  test: {
    database: process.env.LOGISTICS_DB_NAME || 'logistics-db-test',
    username: process.env.LOGISTICS_DB_USER || 'root',
    password: process.env.LOGISTICS_DB_PASSWORD || 'password',
    host: process.env.LOGISTICS_DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    port: Number(process.env.LOGISTICS_DB_PORT),
    logging: false
  },
  production: {
    database: process.env.LOGISTICS_DB_NAME || 'logistics-db-prod',
    username: process.env.LOGISTICS_DB_USER || 'root',
    password: process.env.LOGISTICS_DB_PASSWORD || 'password',
    host: process.env.LOGISTICS_DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    port: Number(process.env.LOGISTICS_DB_PORT),
    logging: false
  }
};