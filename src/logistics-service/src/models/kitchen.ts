import { Model } from 'sequelize';

module.exports = (sequelize: any, DataTypes: any) => {
  
  class Kitchen extends Model {
    static associate(models: any) {
      Kitchen.hasMany(models.Premise, { foreignKey: 'kitchenID', as: 'suppliedPremises' });
      Kitchen.belongsToMany(models.Vehicle, {
        through: 'KitchenVehicles',
        foreignKey: 'kitchenID',
        otherKey: 'vehicleID',
        as: 'associatedVehicles',
      });
    }
  }

  Kitchen.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Kitchen',
    timestamps: false,
  });
  
  return Kitchen;
};


