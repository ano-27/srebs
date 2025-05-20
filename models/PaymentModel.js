module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define(
        'Payment',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            payment_by: {
                type: DataTypes.ENUM('owner', 'customer', 'guest'),
                allowNull: true,
                defaultValue: null
            },
            user_id: {      // foreignKey -- if payment_by 'cutomer' i.e. logged in user
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null
            },
            amount: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null
            },
            order_id: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
            },
            status: {
                type: DataTypes.ENUM('success', 'failure', 'pending'),
                allowNull: true,
                defaultValue: null
            }
        },
        {
            timestamps: true,
            paranoid: true
        }
    );

    Payment.associate = (models) => {
        Payment.belongsTo(models.User, { foreignKey: 'user_id', constraints: false });    // 1 entry in Payments table can belong to only one user (because in Parent, we have defined hasOne) // Payment child, User parent
        Payment.hasMany(models.TransactionHistory, { foreignKey: 'payment_id', constraints: false });
    }
    return Payment;
}