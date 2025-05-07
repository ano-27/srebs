module.exports = (sequelize, DataTypes) => {
    const OfferProduct = sequelize.define(
        'OfferProduct',
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
            percent_off: {
                type: DataTypes.FLOAT,
                allowNull: true
            },
            amount_off: {
                type: DataTypes.FLOAT,
                allowNull: true
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            }
        },
        {
            tableName: 'offer_product',
            timestamps: true,
            paranoid: true,
            freezeTableName: true
        }
    );

    OfferProduct.associate = (models) => {
        OfferProduct.belongsTo(models.Product, { foreignKey: 'product_id', constraints: false });
        OfferProduct.belongsTo(models.Shop, { foreignKey: 'shop_id', constraints: false });
    };

    return OfferProduct;
};