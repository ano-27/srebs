module.exports = (sequelize, DataTypes) => {
    const OfferAmount = sequelize.define(
        'OfferAmount',
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
            on_amount: {
                type: DataTypes.FLOAT,
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
            tableName: 'offer_amount',
            timestamps: true,
            paranoid: true,
            freezeTableName: true
        }
    );

    OfferAmount.associate = (models) => {
        OfferAmount.belongsTo(models.Shop, { foreignKey: 'shop_id', constraints: false });
    };

    return OfferAmount;
};