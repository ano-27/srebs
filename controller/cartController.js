const { createRazorPayInstance } = require('./../config/razorpayConfig.js');
const { models, getSequelize } = require ('../models/index.js');

const razorpayInstance = createRazorPayInstance(); 

exports.addToCart = async (req, res) => {
    console.log('\n = = = ', req.body);
    if (!req?.user || req?.user?.role !== 'customer') {
        return res.status(401).json({
            success: false,
            message: `Not a valid customer`
        });    
    }
    try {
        const { Cart } = models;
        await Cart.create(              // For atomic operations, we don't need transaction
            {
                ...req?.body,
                user_id: req?.user?.id
            }
        );
        return res.status(201).json({
            success: true,
            message: `Product added to Cart` 
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.removeFromCart = async (req, res) => {
    if (!req?.user || req?.user?.role !== 'customer') {
        return res.status(401).json({
            success: false,
            message: `Not a valid customer`
        });    
    }
    try{
        const { Cart } = models;
        const checkExist = await Cart.findByPk(req?.params?.id);
        if (!checkExist) {
            return res.status(400).json({
                success: false,
                message: 'Resource doesnt exist'
            });
        }
        const checkValid = checkExist?.user_id === req?.user?.id;
        if (!checkValid) {
            return res.status(400).json({
                success: false,
                message: 'Resource not linked to user'
            });
        }
        await Cart.destroy({ 
            where: {
                id: req?.params?.id
            }
        });
        return res.status(200).json({
            success: true,
            message: `Product removed from cart` 
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

exports.emptyCart = async (req, res) => {
    if (!req?.user || req?.user?.role !== 'customer') {
        return res.status(401).json({
            success: false,
            message: `Not a valid customer`
        });    
    }
    try {
        const { Cart } = models;
        await Cart.destroy(
            {
                where: {
                    user_id: req?.user?.id
                }
            }
        );
        return res.status(200).json({
            success: true,
            message: `Cart emptied` 
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

exports.checkoutFromCart = async (req, res) => {
    if (!req?.user || req?.user?.role !== 'customer') {
        return res.status(401).json({
            success: false,
            message: `Not a valid customer`
        });    
    }

    try {

        const { Cart, Product } = models;

        const items = await Cart.findAll({
            where: {
                user_id: req?.user?.id
            }
        });

        let amount = 0;
        let productErrorID = [], productErrorName = [], productProceedID = [], productProceedName = [];
        for (let x of items) {
            const product_id = x?.dataValues?.product_id;
            const quantity = x?.dataValues?.quantity;
            const productDetails = await Product.findByPk(product_id);
            if (!productDetails) {
                productErrorID.push(productDetails?.id);
                productErrorName.push(productDetails?.name);
                continue;
            }
            productProceedID.push(productDetails?.id);
            productProceedName.push(productDetails?.name);
            const productCost = productDetails?.price;
            amount += parseFloat(productCost) * quantity; 
        }

        const options = {
            amount: amount * 100,   // An amount of 100 here in razor pay denotes - - > 1.00
            currency: "INR",
            receipt: `receipt_${req?.user?.id}`,
            notes: [
                {
                    'Continuing with products': productProceedName
                },
                {
                    'Skipped products due to error (if any)': productErrorName
                }
            ]
        }

        const order = await razorpayInstance.orders.create(options);
        return res.status(200).json(order);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Error creating order'
        });
    }
}

exports.cartItemList = async (req, res) => {
    const { Cart, Product } = models;
    const items = await Cart.findAll({
        where: {
            user_id: req?.user?.id
        },
        include: {
            model: Product
        },
        order: [
            ['id', 'ASC']
        ]
    });
    return res.status(200).json({
        success: true,
        message: 'Cart items fetched successfully',
        items: items
    });
}