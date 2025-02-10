import { Writable } from 'stream';
import Log from './logModel';

const logStream = new Writable({
    write: async (chunk, _, callback) => {
        try {
            const message = chunk.toString();
            const log = new Log(JSON.parse(message));
            await log.save();
            callback(); 
        } catch (error) {
            console.error('Failed to save log: ', error);
            callback(error as Error);
        }
    }
});

export default logStream;