import mongoose from './mongoose';

const logSchema = new mongoose.Schema({
    level: String,
    message: String,
    timestamp: { type: Date, default: new Date() },
}, { collection: 'logs' });

const Log = mongoose.model('Log', logSchema);

export default Log;