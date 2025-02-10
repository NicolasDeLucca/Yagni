'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('refrigerators', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      guid: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
      },
      brand: {
          type: Sequelize.STRING,
          allowNull: false
      },
      premiseID: {
          type: Sequelize.INTEGER,
          allowNull: false
      },
      isLocked: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('refrigerators');
  }
};
