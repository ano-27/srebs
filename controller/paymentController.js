const { createRazorPayInstance } = require('./../config/razorpayConfig.js');
const { models, getSequelize } = require('./../models/index.js');
const { Op } = require('sequelize');
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
        const { Payment, Cart, TransactionHistory } = models;
        const sequelize = getSequelize();
        const dbTrans = await sequelize.transaction();
        let { order_id, payment_id, signature, user_id, role, amount } = req.body;
        const payment = await razorpayInstance.payments.fetch(payment_id);
        console.log('\n== verifyPayment API payment paymentDetailsArr ==\n', payment.notes.paymentDetailsArr);
        // console.log('\n== verifyPayment API payment productProceedID ==\n', payment.notes.productProceedID);

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
            const addPayment = await Payment.create(
                {
                    payment_by: payment_by,
                    user_id: user_id,
                    order_id: order_id,
                    status: 'success',
                    amount: amount
                },
                {
                    transaction: dbTrans
                }
            );
            if (!addPayment) {
                await dbTrans.rollback();
                console.log('Failed to store payment record in database');
                res.status(500).send('Failed to store payment record in database');
            }

            // Empty cart for the successful payment of products
            if (payment?.notes?.productProceedID) {
                await Cart.destroy({
                    where: {
                        user_id: req?.user?.id,
                        product_id: {
                            [Op.in]: JSON.parse(payment?.notes?.productProceedID)
                        }
                    },
                    transaction: dbTrans
                });
            }

            let transactionData = [];
            if (payment?.notes?.paymentDetailsArr) {
                for (let x of JSON.parse(payment?.notes?.paymentDetailsArr)) {
                    transactionData.push({
                        user_id: req?.user?.id,
                        rzp_order_id: payment?.order_id,
                        rzp_payment_id: payment_id,
                        bought_product_id: x?.product_id,
                        bought_quantity: x?.quantity,
                        payment_id: addPayment?.id
                    });
                }
                // bulkCreate([{ name: 'Jack Sparrow' }, { name: 'Davy Jones' }]);
                await TransactionHistory.bulkCreate(transactionData, {
                    transaction: dbTrans
                });
            }
            await dbTrans.commit();
            res.render('pages/pay-verify.handlebars', {
                message: 'Payment verified',
                layout: 'main.handlebars',
                order_id: order_id,
                amount: amount,
                status: 'success'
            });
        } else {
            await dbTrans.rollback();
            res.render('pages/pay-verify.handlebars', {
                message: 'Payment not verified',
                layout: 'main.handlebars',
                order_id: order_id,
                amount: amount,
                status: 'failure'
            });
        }
    } catch (error) {
        await dbTrans.rollback();
        console.log(error);
        res.status(500).send('Error in payment verification');
    }
}