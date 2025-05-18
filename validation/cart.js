const Joi = require('joi');

const addToCart = Joi.object({
    product_id: Joi.number().required(),
    quantity: Joi.number().required()
});

const editCartItem = Joi.object({
    quantity: Joi.number().integer().min(1).required()
});

module.exports = {
    addToCart,
    editCartItem
}