module.exports = (sequelize, DataTypes) => {
    const Return = sequelize.define(
        'Return',
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
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            issue: {
                type: DataTypes.STRING,
                allowNull: false
            },
            start_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            end_date: {
                type: DataTypes.DATE,
                allowNull: true
            },
            status: {
                type: DataTypes.ENUM('Approved', 'Rejected', 'Pending'),
                allowNull: false,
                defaultValue: 'Pending'
            },
            charges: {
                type: DataTypes.FLOAT,
                allowNull: true
            }
        },
        {
            tableName: 'return',
            timestamps: true,
            paranoid: true,
            freezeTableName: true
        }
    );

    Return.associate = (models) => {
        Return.belongsTo(models.User, { foreignKey: 'user_id', constraints: false });
        Return.belongsTo(models.Product, { foreignKey: 'product_id', constraints: false });
        Return.belongsTo(models.Shop, { foreignKey: 'shop_id', constraints: false });
    };

    return Return;
};