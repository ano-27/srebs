const { models, getSequelize } = require ('../models/index.js');
const bcryptjs = require('bcryptjs');

exports.registerSeller = async (req, res) => {
    const sequelize = getSequelize();
    const dbTrans = await sequelize.transaction();
    try {
        const { User, Shop } = models;
        const { email, password, payment_from, payment_to, location, shop_name } = req?.body;
        const hashedPass = await bcryptjs.hash(password, 10);
        
        // Register User
        const addUser = await User.create({
            email: email,
            password: hashedPass,
            role: 'owner'
        });
        if (!addUser) {
            await dbTrans.rollback();
            return res.status(500).json({
                success: false,
                message: 'Failed to add user' 
            });
        }
        
        // Register Shop
        const addShop = await Shop.create({
            payment_from: payment_from,
            payment_to: payment_to,
            is_active: true,
            location: location,
            owner_user_id: addUser?.id,
            shop_name: shop_name
        });
        if (!addShop) {
            await dbTrans.rollback();
            return res.status(500).json({
                success: false,
                message: 'Failed to add shop' 
            });
        }

        await dbTrans.commit();
        return res.status(201).json({
            success: true,
            message: 'Registration successful' 
        });
    } catch (e) {
        await dbTrans.rollback();
        return res.status(500).json({
            success: false,
            message: 'Failed to register' 
        });
    }
}