import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

//auth
const PUBLIC_KEY = process.env.AUTH_PUBLIC_KEY as string;
const AUDIENCE = process.env.AUTH_AUDIENCE;
const URL = process.env.AUTH_URL;

async function validateAuth(incoming_token:string, expected_role?:string): Promise<boolean> {
    incoming_token = incoming_token.substring(7, incoming_token.length);
    try {
        jwt.verify(incoming_token, PUBLIC_KEY, {
            algorithms: ['RS256'],
            audience: AUDIENCE,
            issuer: URL
        });
        if (expected_role == null){
            return true;
        }else{
            const response = await axios.get(`${URL}/userinfo`, {
                headers: {
                    Authorization: `Bearer ${incoming_token}`,
                }
            });
            return response.status !== 200 || 
                response.data[`${AUDIENCE}/roles`].includes(expected_role);
        }
    }
    catch(error) { return false; }
}

export { validateAuth };