import mongoose from 'mongoose';

const LOGGER_DB_HOST = 'mongodb://localhost:27017/log-database';

mongoose.set('strictQuery', true);

export async function ConnectToLogger(){
    await mongoose.connect(LOGGER_DB_HOST).then(() => {
        console.log('Succesfully connected to the Logger Service');
    }).
    catch((error) => {
        console.error('Error connecting to the Logger Service: ', error);
    });
}

export default mongoose;