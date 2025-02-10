import express from "express";
import dotenv from "dotenv";
import logger from "../../logging/src/logger";

import { connectToRedis } from "./redis";
import { getRefrigeratorsForOrder } from "./services";

async function main() {
    await connectToRedis();
}

main();

dotenv.config();
const API_PORT = process.env.API_PORT;

const app = express();
app.use(express.json());

app.get('/refrigeratorsOrder/:orderId', async (req: any, res: any) => {
    try {
        const orderId = Number(req.params.orderId);
        const refrigerators = await getRefrigeratorsForOrder(orderId);
        return res.status(200).json({ refrigerators });
    }
    catch(err){
        logger.error(`${err}`);
        return res.status(500).json({ error: `${err}` });
    }
});

app.listen(API_PORT, () => {
    logger.info(`Redis service is listening on port ${API_PORT}`);
    console.log(`Redis service is listening on port ${API_PORT}`);
}); 