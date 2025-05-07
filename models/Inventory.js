module.exports = (sequelize, DataTypes) => {
    const Inventory = sequelize.define(
        'Inventory',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            shop_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            tableName: 'inventory',
            timestamps: true,
            paranoid: true,
            freezeTableName: true
        }
    );

    Inventory.associate = (models) => {
        Inventory.belongsTo(models.Product, { foreignKey: 'product_id', constraints: false });
        Inventory.belongsTo(models.Shop, { foreignKey: 'shop_id', constraints: false });
    };

    return Inventory;
};