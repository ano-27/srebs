const Joi = require('joi');

const addToCart = Joi.object({
    product_id: Joi.number().required(),
    quantity: Joi.number().required()
});

module.exports = {
    addToCart
}