module.exports = (sequelize, DataTypes) => {    // Anonymous function assigned to module.exports and which is returning a Model
    const User = sequelize.define(
        'User',
        {
            // Attributes
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {isEmail: true}
            },
            role: {
                type: DataTypes.ENUM('owner', 'customer'),
                allowNull: true,
                defaultValue: 'customer'
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            refreshToken: {
                type: DataTypes.TEXT,
                allowNull: true
            }

        },
        {
            // Other options
            timestamps: true,
            paranoid: true     // Soft delete - - > Extra column - - > deletedAt
        }
    );
    User.associate = (models) => {
        User.hasMany(models.Payment, { foreignKey: 'user_id', constraints: false });    // One user can do multiple payments. Payment table can have two or more different payment_id linked to one user_id
        User.hasMany(models.Shop, { foreignKey: 'owner_user_id', constraints: false});  // One user can be owner of multiple shops.
    }
    return User;
}