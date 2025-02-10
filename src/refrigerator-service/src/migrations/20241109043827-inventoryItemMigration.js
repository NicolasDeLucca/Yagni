'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('inventoryItems', {
      id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
      },
      productID: {
          type: Sequelize.INTEGER,
          allowNull: false
      },
      quantity: {
          type: Sequelize.INTEGER,
          allowNull: false
      },
      refrigeratorID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
              model: { tableName: 'refrigerators' },
              key: 'id'
          }
      }
  })},

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('inventoryItems');
  }
};
