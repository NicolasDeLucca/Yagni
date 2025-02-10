import axios from 'axios';   
import logger from '../../logging/src/logger';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const AUTH_URL = process.env.AUTH_URL as string;
const AUTH_AUDIENCE = process.env.AUTH_AUDIENCE as string;
const AUTH_CLIENT_ID = process.env.AUTH_CLIENT_ID as string;
const AUTH_CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET as string;
const PUBLIC_KEY = process.env.PUBLIC_KEY as string;

async function setToken() {
    try {
        const response = await axios.post(`${AUTH_URL}/oauth/token`, {
            client_id: AUTH_CLIENT_ID,
            client_secret: AUTH_CLIENT_SECRET,
            audience: AUTH_AUDIENCE,
            grant_type: "client_credentials"
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        const token = response.data.access_token;
        console.log('Refrigerator App - Successful connection with IDP.'); 
        logger.info('Refrigerator App - Successful connection with IDP', { token });
        return token;
    } catch (error) {
        logger.error(`Refrigerator App - Connection with IDP Failed: ${error}`);
        console.error('Refrigerator App - Connection with IDP Failed.');
    }
}

async function validateAuthentication(incoming_token:string): Promise<boolean> {
    try {
        jwt.verify(incoming_token, PUBLIC_KEY, {
            algorithms: ['RS256'],
            audience: AUTH_AUDIENCE,
            issuer: AUTH_URL
        });
        return true;
    }
    catch(error) { return false; }
}

export { setToken, validateAuthentication };