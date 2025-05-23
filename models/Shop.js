module.exports = (sequelize, DataTypes) => {    
    const Shop = sequelize.define(
        'Shop',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            shop_name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            owner_user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            payment_from: {     // Time frame for which shop has agred to use SREBS
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            payment_to: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            location: {
                type: DataTypes.TEXT,     
                defaultValue: null
            }
        },
        {
            tableName: 'shop',
            timestamps: true,
            paranoid: true,
            freezeTableName: true
        }
    );
    Shop.associate = (models) => {
        Shop.hasMany(models.Product, { foreignKey: 'shop_id', constraints: false });
        Shop.belongsTo(models.User, { foreignKey: 'owner_user_id', constraints: false });
    }
    return Shop;
}