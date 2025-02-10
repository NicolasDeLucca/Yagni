import { ManagementClient } from 'auth0';
import dotenv from 'dotenv';

dotenv.config();

const management = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN as string,
    clientId: process.env.AUTH0_CLIENT_ID as string,
    clientSecret: process.env.AUTH0_CLIENT_SECRET as string,
    scope: 'create:users read:roles read:users update:users',
});

export default management;
  