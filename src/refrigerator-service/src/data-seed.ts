const { Refrigerator, sequelize } = require('./models');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    await Refrigerator.bulkCreate([
      {
        guid: 'FRIDGE-001',
        brand: 'BrandA',
        premiseID: 1,
        isLocked: true,
      },
      {
        guid: 'FRIDGE-002',
        brand: 'BrandB',
        premiseID: 1,
        isLocked: true,
      },
      {
        guid: 'FRIDGE-003',
        brand: 'BrandC',
        premiseID: 2,
        isLocked: true,
      },
      {
        guid: 'FRIDGE-004',
        brand: 'BrandD',
        premiseID: 2,
        isLocked: true,
      },
    ]);

    console.log('Refrigerators seeded successfully.');
  } catch (error) {
    console.error('Error seeding refrigerators:', error);
  } finally {
    await sequelize.close();
  }
};

export default seedData;