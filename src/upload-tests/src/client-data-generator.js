import { faker } from '@faker-js/faker';

const generateClients = (count) => {
  const clientsData = [];
  for (let i = 0; i < count; i++) {
    const client = {
      email: faker.internet.email(),
      name: faker.person.firstName(),
      cellphone: faker.phone.number('##########'), 
      paymentMethods: faker.helpers.arrayElements(
        ['method1', 'method2', 'method3', 'method4'], 
        faker.datatype.number({ min: 1, max: 3 }) 
      ),
    };
    clientsData.push(client);
  }
  return clientsData;
};

// Genera 10,000 clientes
export const clientsData = generateClients(10000);