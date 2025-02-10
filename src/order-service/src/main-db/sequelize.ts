import { Sequelize } from 'sequelize';

import config from './config'; 
import logger from '../../../logging/src/logger';

const sequelize = new Sequelize(config.development);

async function Connect(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Order Database connected successfully');
    logger.info('Order Database connected successfully');
  } 
  catch (error) {
    console.error('Unable to connect to the Order database:', error);
    logger.error('Unable to connect to the Order database:', error);
  }
}

Connect();

export default sequelize;
