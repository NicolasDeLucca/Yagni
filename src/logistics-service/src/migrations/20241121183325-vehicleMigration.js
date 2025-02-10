'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehicles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      licensePlate: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    // Tabla intermedia para la relación muchos-a-muchos entre Kitchen y Vehicle
    await queryInterface.createTable('KitchenVehicles', {
      kitchenID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'kitchens',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        primaryKey: true,
      },
      vehicleID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vehicles',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        primaryKey: true,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('KitchenVehicles');
    await queryInterface.dropTable('vehicles');
  }
};
