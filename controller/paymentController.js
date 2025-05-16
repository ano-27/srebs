const { createRazorPayInstance } = require('./../config/razorpayConfig.js');
const { models } = require('./../models/index.js');
const crypto = require('crypto');
require('dotenv').config();

const razorpayInstance = createRazorPayInstance();  // Instance of Razor Pay

exports.createOrder = async(req, res) => {
    if (!req.user) {
        return res.status(500).json({
            success: false,
            message: 'Access denied for creating order'
        });
    }
    const { productId, amount } = req.body;
    const options = {
        amount: amount * 100,   // An amount of 100 here in razor pay denotes - - > 1.00
        currency: "INR",
        receipt: `receipt-${productId}__${req?.user?.id}`,
    }
    try {
        const order = await razorpayInstance.orders.create(options);
        return res.status(200).json({
            success: true,
            order: order
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Error creating order'
        });
    }
}

exports.checkoutPage = async(req, res) => {
    try {
        let order_id = req.query.order_id;
        const order = await razorpayInstance.orders.fetch(order_id);
        const amount = order.amount / 100; 
        res.render('pages/checkout.handlebars', {
            layout: 'main.handlebars',
            order_id: order_id,
            amount: amount,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error processing checkout');
    }
}

exports.verifyPayment = async(req, res) => {
    try {
        const { Payment } = models;
        let { order_id, payment_id, signature, user_id, role, amount } = req.body;
        let payment_by = null;
        if (role && (role === 'customer' || role === 'owner')) {
            payment_by = role;
        } else {
            payment_by = 'guest';
            user_id = null;
        }
        const secret = process.env.RAZORPAY_KEY_SECRET;
    
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(order_id + '|' + payment_id);
    
        const generatedSignature = hmac.digest('hex');
        
        if (generatedSignature == signature) {
            const addPayment = await Payment.create({
                payment_by: payment_by,
                user_id: user_id,
                order_id: order_id,
                status: 'success',
                amount: amount
            });
            if (!addPayment) {
                console.log('Failed to store payment record in database');
                res.status(500).send('Failed to store payment record in database');
            }
            res.render('pages/pay-verify.handlebars', {
                message: 'Payment verified',
                layout: 'main.handlebars',
                order_id: order_id,
                amount: amount,
                status: 'success'
            });
        } else {
            res.render('pages/pay-verify.handlebars', {
                message: 'Payment not verified',
                layout: 'main.handlebars',
                order_id: order_id,
                amount: amount,
                status: 'failure'
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Error in payment verification');
    }
}