const { Kitchen, Premise, Vehicle, sequelize } = require('./models');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    await Kitchen.bulkCreate([
      { address: '123 Main Street' },
      { address: '456 Elm Street' }
    ]);

    await Premise.bulkCreate([
      { address: '789 Oak Street', kitchenID: 1 },
      { address: '101 Pine Street', kitchenID: 2 },
    ]);

    await Vehicle.bulkCreate([
      { licensePlate: 'ABC123', kitchenID: 1 },
      { licensePlate: 'XYZ789', kitchenID: 2 },
      { licensePlate: 'LMN456', kitchenID: 1 },
      { licensePlate: 'QRS852', kitchenID: 2 }
    ]);

    console.log('Seed data populated successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await sequelize.close();
  }
};

export default seedData;