module.exports = (sequelize, DataTypes) => {    
    const Product = sequelize.define(
        'Product',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            shop_id: {
                type: DataTypes.INTEGER
            },
            product_type: {
                type: DataTypes.ENUM('singular', 'dozen', 'loose_gram', 'loose_ml'),
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            price: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            expiry: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            return_window: {    // days
                type: DataTypes.INTEGER,     
                defaultValue: 7,
                allowNull: true
            }
        },
        {
            tableName: 'product',
            timestamps: true,
            paranoid: true,
            freezeTableName: true
        }
    );
    Product.associate = (models) => {
        Product.belongsTo(models.Shop, { foreignKey: 'shop_id', constraints: false });
    }
    return Product;
}