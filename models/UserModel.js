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
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
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
    return User;
}