import { DataTypes } from 'sequelize';
import sequelize from '../sequelize';
import { Order } from './order';

const Client = sequelize.define(
  'Client', 
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cellphone: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    paymentMethods: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }
);

Client.hasMany(Order, {
  foreignKey: 'idClient'
});

export { Client };

