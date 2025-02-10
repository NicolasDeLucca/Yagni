'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orderCodes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      productID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      kitchenID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'kitchens',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      destinationPremiseID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'premises',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      destinationRefrigeratorID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      productionDatetime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orderCodes');
  }
};
