const { createRazorPayInstance } = require('./../config/razorpayConfig.js');
const crypto = require('crypto');
require('dotenv').config();

const razorpayInstance = createRazorPayInstance();  // Instance of Razor Pay

exports.createOrder = async(req, res) => {
    // In Production - - > Dont accept 'amount' from client - - > As, it can be changed from Inspect Element - - > Later we will fetch amount from Database using id of the entity
    const { courseId, courseName, amount } = req.body;
    const options = {
        amount: amount * 100,   // An amount of 100 here in razor pay denotes - - > 1.00
        currency: "INR",
        receipt: 'receipt_order_1',
    }
    try {
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

exports.checkoutPage = async(req, res) => {
    try {
        let order_id = req.query.order_id;
        const order = await razorpayInstance.orders.fetch(order_id);
        const amount = order.amount / 100; 
        res.render('checkout.handlebars', {
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
    const { order_id, payment_id, signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(order_id + '|' + payment_id);

    const generatedSignature = hmac.digest('hex');
    
    if (generatedSignature == signature) {
        // << Any DB operation that we like can be performed here >>
        return res.status(200).json({
            success: true,
            message: 'Payment verified'
        });
    } else {
        return res.status(500).json({
            success: false,
            message: 'Payment not verified'
        })
    }
}