import * as readline from 'readline';
import logger from '../../logging/src/logger';

export async function batchReady(kitchen_id: number){
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(`Batch at kitchen with id: ${kitchen_id}, is ready!`, () => {
        logger.info(`Batch at kitchen with id: ${kitchen_id}, is ready!`);
        rl.close(); 
    });
}
    