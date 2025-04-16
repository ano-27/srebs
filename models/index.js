const { Sequelize } = require('sequelize');
const { DataTypes } = require ('sequelize');
const UserModel = require('./userModel.js');  // Function

let sequelize = null;
let models = {};

const dbConnection = async (database, username, password) => {  // Function to connect with database and initialize models
    sequelize = new Sequelize(database, username, password, {
        host: 'localhost',
        dialect: 'postgres'
    });

    try {
        await sequelize.authenticate();
        console.log('\nConnection with database successful >>>\n');

        // Initialize all models : Define structure and metadata of tables
        models.User = UserModel(sequelize, DataTypes);  

        // Sync models
        await sequelize.sync({alter: true});
        console.log('\nDatabases synced successfully >>>\n');

        return models;
    } catch (err) {
        console.log('Unable to connect to database:', err);
        throw err;
    }
};

module.exports = {
    dbConnection,
    models
}