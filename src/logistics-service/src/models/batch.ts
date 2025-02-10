import { Model } from 'sequelize';

module.exports = (sequelize: any, DataTypes: any) => {
  class Batch extends Model {
    static associate(models: any) {
      Batch.hasMany(models.ProductBox, { foreignKey: 'batchID', as: 'productBoxes' });
    }
  }

  Batch.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ready: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    in_premise: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Batch',
    timestamps: false,
  });

  return Batch;
};
