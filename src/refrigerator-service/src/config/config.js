require('dotenv').config();

module.exports = {
  development: {
    database: process.env.REFRIGERATOR_DB_NAME || 'refrigerator-db',
    username: process.env.REFRIGERATOR_DB_USER || 'root',
    password: process.env.REFRIGERATOR_DB_PASSWORD || 'password',
    host: process.env.REFRIGERATOR_DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    port: Number(process.env.REFRIGERATOR_DB_PORT),
    logging: false
  },
  test: {
    database: process.env.REFRIGERATOR_DB_NAME || 'refrigerator-db-test',
    username: process.env.REFRIGERATOR_DB_USER || 'root',
    password: process.env.REFRIGERATOR_DB_PASSWORD || 'password',
    host: process.env.REFRIGERATOR_DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    port: Number(process.env.REFRIGERATOR_DB_PORT),
    logging: false
  },
  production: {
    database: process.env.REFRIGERATOR_DB_NAME || 'refrigerator-db-prod',
    username: process.env.REFRIGERATOR_DB_USER || 'root',
    password: process.env.REFRIGERATOR_DB_PASSWORD || 'password',
    host: process.env.REFRIGERATOR_DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    port: Number(process.env.REFRIGERATOR_DB_PORT),
    logging: false
  }
};