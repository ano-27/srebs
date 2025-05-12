const Joi = require('joi');

const addToCart = Joi.object({
    shop_id: Joi.number().required(),
    product_type: Joi.string().valid('singular', 'dozen', 'loose_gram', 'loose_ml').required(),
    name: Joi.string().required(),
    price: Joi.number().precision(2).min(0).required(),
    expiry: Joi.date().optional(),
    return_window: Joi.number().optional(),
    stock: Joi.number().optional()
});

module.exports = {
    addToCart
}