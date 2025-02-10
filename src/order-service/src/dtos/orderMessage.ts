export interface orderMessage {
    id: String;
    clientId: String;
    clientName: String;
    date: Date;
    pickUpDate: Date;
    pickUp: number;
    totalPrice: number;
    status?: String;
    arrivalTime?: String;
}