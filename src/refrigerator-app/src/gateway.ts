import { Response } from 'express';
import axios, { Method } from 'axios';
import logger from '../../logging/src/logger';

export default async function gateway(req: any, res: Response, url: string, token?: string) {
    try {
        const method = req.method as Method; 
        const response = await axios({
            method,
            url,
            data: req.body, 
            headers: {
                ...req.headers,
                Authorization: `Bearer ${token}`, 
            },
            params: req.query
        });
        res.status(response.status).json(response.data);
    } catch (error: any) {
        res.status(error.response?.status || 500)
           .json(error.response?.data || 
                { message: error.response?.message || 'Refrigerator Control-App Error' });
        if (!error.response?.data && !error.response?.message){
            logger.error('Refrigerator Control-App Error');
        }
    }
}