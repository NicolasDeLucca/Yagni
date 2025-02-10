import { DataTypes } from 'sequelize';
import sequelize from '../sequelize';

const Product = sequelize.define(
  'Product', 
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    ingredients: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    listPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
  }
});

export { Product };

