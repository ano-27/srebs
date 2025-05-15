const Joi = require('joi');

const registerProduct = Joi.object({
    shop_id: Joi.number().required(),
    product_type: Joi.string().valid('singular', 'dozen', 'loose_gram', 'loose_ml').required(),
    name: Joi.string().required(),
    price: Joi.number().precision(2).min(0).required(),
    expiry: Joi.date().optional(),
    return_window: Joi.number().optional(),
    stock: Joi.number().optional()
});

const editProduct = Joi.object({
    shop_id: Joi.number().optional(),
    product_type: Joi.string().valid('singular', 'dozen', 'loose_gram', 'loose_ml').optional(),
    name: Joi.string().optional(),
    price: Joi.number().precision(2).min(0).optional(),
    return_window: Joi.number().optional()
});

const editProductInventory = Joi.object({
    expiry: Joi.date().optional(),
    stock: Joi.number().optional()
});

const newBatchOfStock = Joi.object({
    shop_id: Joi.number().optional(),
    product_id: Joi.number().required(),
    expiry: Joi.date().optional(),
    stock: Joi.number().required()
});

module.exports = {
    registerProduct,
    editProduct,
    editProductInventory,
    newBatchOfStock
}