module.exports = (sequelize, DataTypes) => {    
    const Cart = sequelize.define(
        'Cart',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
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
            tableName: 'cart',
            timestamps: true,
            paranoid: true,
            freezeTableName: true
        }
    );
    Cart.associate = (models) => {
        // Cart.hasMany(models.Product, { foreignKey: 'shop_id', constraints: false });
        Cart.belongsTo(models.Product, { foreignKey: 'product_id', constraints: false });
        Cart.belongsTo(models.User, { foreignKey: 'user_id', constraints: false });
    }
    return Cart;
}