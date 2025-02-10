import { Request, Response } from 'express';
import axios, { Method } from 'axios';
import logger from '../../../logging/src/logger';

export default async function gateway(req: Request, res: Response, url: string) {
    try {
        const method = req.method as Method; 
        const response = await axios({
            method,
            url,
            data: req.body, 
            headers: req.headers, 
            params: req.query, 
        });

        res.status(response.status).json(response.data);
    } catch (error: any) {
        res.status(error.response?.status || 500)
           .json(error.response?.data || { message: 'Api Gateway Error' });
        if (!error.response?.data) {
            logger.error('Api Gateway Error', error); 
        }
    }
}
