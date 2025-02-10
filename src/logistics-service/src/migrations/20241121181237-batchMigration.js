'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('batches', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      ready: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      in_premise: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('batches');
  }
};