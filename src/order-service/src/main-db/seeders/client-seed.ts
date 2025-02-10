import { Op } from 'sequelize';

import { Client } from '../models/client';
import management from '../../../../idp/src/config';
import { seedClients } from "../../../../idp/src/seedUsers";
import { ClientUser } from "../../../../idp/src/models";
import logger from '../../../../logging/src/logger';

const clientsData = [
  { email: 'client1@example.com', name: "name1", cellphone: '1234567890', paymentMethods: ['method1', 'method2'] },
  { email: 'client2@example.com', name: "name2", cellphone: '1234567891', paymentMethods: ['method1', 'method2'] },
  { email: 'client3@example.com', name: "name3", cellphone: '1234567892', paymentMethods: ['method1', 'method2'] },
  { email: 'client4@example.com', name: "name4", cellphone: '1234567893', paymentMethods: ['method1', 'method2'] },
  { email: 'client5@example.com', name: "name5", cellphone: '1234567894', paymentMethods: ['method1', 'method2'] },
  { email: 'client6@example.com', name: "name6", cellphone: '1234567895', paymentMethods: ['method1', 'method3'] },
  { email: 'client7@example.com', name: "name7", cellphone: '1234567896', paymentMethods: ['method1', 'method3'] },
  { email: 'client8@example.com', name: "name8", cellphone: '1234567897', paymentMethods: ['method1', 'method3'] },
  { email: 'client9@example.com', name: "name9", cellphone: '1234567898', paymentMethods: ['method1', 'method3'] },
  { email: 'client10@example.com', name: "name10", cellphone: '1234567899', paymentMethods: ['method1', 'method3'] },
];

const clientAuth0Data = () => {
    const clients: ClientUser[] = [];
    for (const client of clientsData) {
        clients.push({
            name: client.name,
            role: 'client',
            email: client.email,
            cellphone: client.cellphone,
            paymentMethods: client.paymentMethods,
        });
    }
    return clients;
}

const checkClientsInDB = async () => {
    const emails = clientsData.map(client => client.email);
    const existingClients = await Client.findAll({
        where: {
            email: {
                [Op.in]: emails, 
            },
        },
    });
    return existingClients.map(client => client.dataValues.email); 
};

const checkClientsInAuth0 = async () => {
    const existingAuth0Clients: string[] = [];
    for (const client of clientAuth0Data()) {
        const users = await management.getUsers({
            q: `email:"${client.email}"`, 
            search_engine: 'v3',
        });
        if (users.length > 0) {
            existingAuth0Clients.push(client.email);
        }
    }
    return existingAuth0Clients;
};

export default async () => {
    try {
        const existingClientsInDB = await checkClientsInDB();
        const remainingClientsForDB = clientsData.filter(
            client => !existingClientsInDB.includes(client.email)
        );
        const existingClientsInAuth0 = await checkClientsInAuth0();
        const remainingClientsForAuth0 = clientAuth0Data().filter(
            client => !existingClientsInAuth0.includes(client.email)
        );
        if (remainingClientsForDB.length > 0) {
            await Client.bulkCreate(remainingClientsForDB);
            console.log('New clients added to MySQL.');
        } else {
            console.log('All clients already exist in MySQL.');
        }
        if (remainingClientsForAuth0.length > 0) {
            await seedClients(remainingClientsForAuth0);
            console.log('New clients added to Auth0.');
        } else {
            console.log('All clients already exist in Auth0.');
        }
        logger.info('Client data populated successfully.');
    } 
    catch (error) {
        logger.error('Error populating client data:', error);
        console.error('Error populating client data:', error);
    }
};

