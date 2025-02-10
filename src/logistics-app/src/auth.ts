import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const AUDIENCE = process.env.AUTH_AUDIENCE;
const URL = process.env.AUTH_URL;
const PUBLIC_KEY = process.env.AUTH_PUBLIC_KEY as string;

export default async function validateAuthentication(incoming_token:string): Promise<boolean> {
    try {
        jwt.verify(incoming_token, PUBLIC_KEY, {
            algorithms: ['RS256'],
            audience: AUDIENCE,
            issuer: URL
        });
        return true;
    }
    catch(error) { return false; }
}