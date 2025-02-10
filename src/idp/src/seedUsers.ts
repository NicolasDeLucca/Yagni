import management from "./config";
import { User, ClientUser } from "./models";
import logger from "../../logging/src/logger";

const users: User[] = [
  { name: 'John Doe', role: 'admin' },
  { name: 'Alice Brown', role: 'employee' },
  { name: 'Harry Allen', role: 'employee' },
  { name: 'Barry Hall', role: 'employee' },
  { name: 'Denisse Bell', role: 'employee' },
  { name: 'Jane Smith', role: 'kitchen_supervisor' },
  { name: 'Bonnie Hanson', role: 'kitchen_supervisor' },
  { name: 'Jail Hitel', role: 'premise_supervisor' },
  { name: 'Ab Ajan', role: 'premise_supervisor' },
  { name: 'Refrigerator Device', role: 'refrigerator_device' },
  { name: 'Kitchen Device', role: 'kitchen_device' }
];

const seedUsers = async () => {
  try {
    for (const user of users) {
      console.log(`Creating user: ${user.name}`);   
      const createdUser = await management.createUser({
        connection: 'Username-Password-Authentication',
        email: `${user.name.replace(' ', '.').toLowerCase()}@yagni.com`,
        password: 'SecurePass123!',
        name: user.name,
        user_metadata: { role: user.role },
      });
      console.log(`User created: ${createdUser.user_id}`);
      const roles = await management.getRoles();
      const roleToAssign = roles.find((r) => r.name === user.role);
      if (roleToAssign) {
        const roleId = roleToAssign.id;
        if (roleId) {
          const userId = createdUser.user_id;
          if (userId) {
            management.assignRolestoUser({ id: userId }, { roles: [roleId] });
            console.log(`Role "${user.role}" assigned to user: ${user.name}`);
          } else {
            console.error('User ID is undefined. Cannot assign role.');
          }
        } else {
          console.error('Role ID is undefined. Cannot assign role.');
        }
      } else {
        console.error(`Role "${user.role}" not found in Auth0`);
      }      
    }
    logger.info('Seeding completed successfully.');
    console.log('Seeding completed successfully.');
  } catch (error) {
    logger.error('Error seeding users: ', error);
    console.error('Error seeding users: ', error);
  }
};

export const seedClients = async (clientsData: ClientUser[]) => {
  try {
    for (const client of clientsData) {
      console.log(`Creating client: ${client.name}`);
      const createdClient = await management.createUser({
        connection: 'Username-Password-Authentication',
        email: client.email,
        password: 'SecureClientPass123!',
        name: client.name,
        user_metadata: { 
          role: 'client', 
          cellphone: client.cellphone, 
          paymentMethods: client.paymentMethods
        },
      });
      console.log(`Client created: ${createdClient.user_id}`);
      const roles = await management.getRoles();
      const clientRole = roles.find((r) => r.name === 'client');
      if (clientRole) {
        const roleId = clientRole.id;
        if (roleId) {
          const userId = createdClient.user_id;
          if (userId) {
            await management.assignRolestoUser({ id: userId }, { roles: [roleId] });
            console.log(`Role "client" assigned to client: ${client.name}`);
          } else {
            console.error('Client ID is undefined. Cannot assign role.');
          }
        } else {
          console.error('Client role ID is undefined. Cannot assign role.');
        }
      } else {
        console.error('Role "client" not found in Auth0.');
      }
    }
    logger.info('Client seeding completed successfully.');
    console.log('Client seeding completed successfully.');
  } catch (error) {
    logger.error('Error seeding clients: ', error);
    console.error('Error seeding clients: ', error);
  }
};


seedUsers();
