import { orderProduct } from './orderProduct';

export interface order {
    userId: number;
    totalPrice: number;
    products: orderProduct[];
    paymentMethod: string;
    pickUpDate: Date;
    pickUp: number;
}