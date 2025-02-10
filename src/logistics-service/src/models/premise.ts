import { Model } from 'sequelize';

module.exports = (sequelize: any, DataTypes: any) => {
  class Premise extends Model {
    static associate(models: any) {
      Premise.belongsTo(models.Kitchen, { foreignKey: 'kitchenID', as: 'kitchen' });
    }
  }

  Premise.init({
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
    modelName: 'Premise',
    timestamps: false,
  });

  return Premise;
};
