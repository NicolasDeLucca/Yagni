import { DataTypes } from 'sequelize';
import sequelize from '../sequelize';
import { Product } from './product';

const Order = sequelize.define(
  'Order', 
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    totalPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pickUpDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    pickUp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    arrivalTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('in-refrigerator', 'completed', 'incomplete'),
      allowNull: true,
    }
  }
);

const OrderProducts = sequelize.define('OrderProducts', {
  cant: DataTypes.INTEGER
}, { timestamps: false });

Order.belongsToMany(Product, { through: OrderProducts });
Product.belongsToMany(Order, { through: OrderProducts });

export { Order, OrderProducts };