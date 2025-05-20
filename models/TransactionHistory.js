module.exports = (sequelize, DataTypes) => {
    const TransactionHistory = sequelize.define(
        'TransactionHistory',
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
            payment_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            rzp_order_id: {
                type: DataTypes.STRING,
                allowNull: false
            },
            rzp_payment_id: {
                type: DataTypes.STRING,
                allowNull: false
            },
            bought_product_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            bought_quantity: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            tableName: 'transaction_history',
            timestamp: true,
            paranoid: true,
            freezeTableName: true
        } 
    );

    TransactionHistory.associate = (models) => {
        TransactionHistory.belongsTo(models.User, { foreignKey: 'user_id', constraints: false });
        TransactionHistory.belongsTo(models.Payment, { foreignKey: 'payment_id', constraints: false });
        TransactionHistory.belongsTo(models.Product, { foreignKey: 'bought_product_id', constraints: false });
    }

    return TransactionHistory;
}