import { Response } from 'express';
import axios, { Method } from 'axios';
import logger from '../../logging/src/logger';

export default async function gateway(req: any, res: Response, url: string) {
    try {
        const method = req.method as Method; 
        const response = await axios({
            method,
            url,
            data: req.body, 
            headers: {
                ...req.headers 
            },
            params: req.query
        });
        res.status(response.status).json(response.data);
    } catch (error: any) {
        res.status(error.response?.status || 500)
           .json(error.response?.data || 
                { message: error.response?.message || 'Logistics App Error' });
        if (!error.response?.data && !error.response?.message){
            logger.error('Logistics App Error');
        }
    }
}