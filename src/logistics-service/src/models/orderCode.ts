import { Model } from 'sequelize';

module.exports = (sequelize: any, DataTypes: any) => {
  class OrderCode extends Model {
    static associate(models: any) {
      OrderCode.belongsTo(models.Kitchen, { foreignKey: 'kitchenID', as: 'kitchen' });
      OrderCode.belongsTo(models.Premise, { foreignKey: 'destinationPremiseID', as: 'destinationPremise' });
    }
  }

  OrderCode.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kitchenID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Kitchen', key: 'id' },
    },
    destinationPremiseID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Premise', key: 'id' },
    },
    destinationRefrigeratorID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productionDatetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'OrderCode',
    timestamps: false,
  });

  return OrderCode;
};
