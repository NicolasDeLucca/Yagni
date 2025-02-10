import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../../../logging/src/logger';

dotenv.config();

const REPORTS_DB_HOST = process.env.MONGO_REPORTS_URI as string;

mongoose.set('strictQuery', true);

export async function ConnectToReports(){
    await mongoose.connect(REPORTS_DB_HOST).then(() => {
        logger.info('Succesfully connected to the Reports Service');
        console.log('Succesfully connected to the Reports Service');
    }).
    catch((error) => {
        logger.error('Error connecting to the Reports Service: ', error);
        console.error('Error connecting to the Reports Service.');
    });
}

export default mongoose;