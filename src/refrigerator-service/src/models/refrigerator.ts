import { Model }  from 'sequelize';

module.exports = (sequelize: any, DataTypes: any) => {
    
  class Refrigerator extends Model {
    static associate(models: any) {
      Refrigerator.hasMany(models.InventoryItem, { foreignKey: 'refrigeratorID', as: 'items' });
    }
  }
  Refrigerator.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: false
    },
    premiseID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isLocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Refrigerator',
    timestamps: false
  });

  return Refrigerator;
};