import { Model }  from 'sequelize';

module.exports = (sequelize: any, DataTypes: any) => {
    
  class InventoryItem extends Model {
    static associate(models: any) {
        InventoryItem.belongsTo(models.Refrigerator, { foreignKey: 'refrigeratorID', as: 'inventory' });
    }
  }
  InventoryItem.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    productID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    refrigeratorID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: { tableName: 'Refrigerator' },
            key: 'id'
        }
    }
  }, {
    sequelize,
    modelName: 'InventoryItem',
    timestamps: false
  });

  return InventoryItem;
};
