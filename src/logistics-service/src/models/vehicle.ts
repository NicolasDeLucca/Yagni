import { Model } from 'sequelize';

module.exports = (sequelize: any, DataTypes: any) => {
  class Vehicle extends Model {
    static associate(models: any) {
      Vehicle.belongsToMany(models.Kitchen, {
        through: 'KitchenVehicles',
        foreignKey: 'vehicleID',
        otherKey: 'kitchenID',
        as: 'kitchens',
      });
    }
  }

  Vehicle.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    licensePlate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Vehicle',
    timestamps: false,
  });

  return Vehicle;
};
