import { Model } from 'sequelize';

module.exports = (sequelize: any, DataTypes: any) => {
  class ProductBox extends Model {
    static associate(models: any) {
      ProductBox.belongsTo(models.Batch, { foreignKey: 'batchID', as: 'batch' });
      ProductBox.belongsTo(models.OrderCode, { foreignKey: 'orderCodeID', as: 'orderCode' });
    }
  }

  ProductBox.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    batchID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Batch', key: 'id' },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    orderCodeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'OrderCode', key: 'id' },
    },
    orderID: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ProductBox',
    timestamps: false,
  });

  return ProductBox;
};
