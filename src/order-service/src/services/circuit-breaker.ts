import CircuitBreaker from 'opossum';
import logger from '../../../logging/src/logger'; 

const options = {
    timeout: 5000, // Tiempo máximo en ms permitido para ejecutar la función
    errorThresholdPercentage: 50, // Porcentaje de fallos para abrir el circuito
    resetTimeout: 10000, // Tiempo en ms para intentar reabrir el circuito
};

export default class Breaker {
    private circuitBreaker: CircuitBreaker;

    constructor(action: any) {
        this.circuitBreaker = new CircuitBreaker(action, options);

        this.circuitBreaker.on('open', () => {
            logger.warn('Payment Circuit Breaker Opened: Service unavailable');
        });

        this.circuitBreaker.on('halfOpen', () => {
            logger.info('Payment Circuit Breaker Half-Open: Retrying...');
        });

        this.circuitBreaker.on('close', () => {
            logger.info('Payment Circuit Breaker Closed: Service restored');
        });
    }

    async fire(body: any) {
        try {
            return await this.circuitBreaker.fire(body);
        } 
        catch (error) {
            if (this.circuitBreaker.opened) {
                logger.error(`Payment Service Unavailable. Payment Circuit Breaker is Open.`);
                return 503; 
            } 
            else {
                logger.error(`Payment Failed: ${error}`);
                return 500;
            }
        }
    }
}

