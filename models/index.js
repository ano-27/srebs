const { Sequelize } = require('sequelize');
const { DataTypes } = require ('sequelize');
const UserModel = require('./UserModel.js');  // These are functions
const PaymentModel = require('./PaymentModel.js');  
const Cart = require('./Cart.js');
const OfferProduct = require('./OfferProduct.js');
const OfferAmount = require('./OfferAmount.js');
const Return = require('./Return.js');
const Inventory = require('./Inventory.js');
const Product = require('./Product.js');
const Shop = require('./Shop.js');
const TransactionHistory = require('./TransactionHistory.js');
const dotenv = require('dotenv');
dotenv.config();

let sequelize = null;
let models = {};

const dbConnection = async (database, username, password) => {  // Function to connect with database and initialize models
    sequelize = new Sequelize(database, username, password, {
        host: process.env.PG_HOST || 'localhost',
        dialect: 'postgres'
    });

    try {
        await sequelize.authenticate();
        console.log('\nConnection with database successful >>>\n');

        // Initialize all models : Define structure and metadata of tables
        models.User = UserModel(sequelize, DataTypes);
        models.Payment = PaymentModel(sequelize, DataTypes);
        models.Cart = Cart(sequelize, DataTypes);
        models.OfferProduct = OfferProduct(sequelize, DataTypes);
        models.OfferAmount = OfferAmount(sequelize, DataTypes);
        models.Return = Return(sequelize, DataTypes);
        models.Inventory = Inventory(sequelize, DataTypes);
        models.Product = Product(sequelize, DataTypes);
        models.Shop = Shop(sequelize, DataTypes);
        models.TransactionHistory = TransactionHistory(sequelize, DataTypes);

        // Handle associations
        Object.values(models).forEach(model => {
            if (typeof model.associate === 'function') {
                model.associate(models);
            }
        });

        // Sync tables
        await sequelize.sync({ alter: false });
        console.log('\nDatabases synced successfully >>>\n');

        return models;
    } catch (err) {
        console.log('Unable to connect to database:', err);
        throw err;
    }
};

module.exports = {
    dbConnection,
    models,
    sequelize,
    getSequelize: () => sequelize
}