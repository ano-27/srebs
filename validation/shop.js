const Joi = require('joi');

const registerSeller = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    payment_from: Joi.date().required(),
    payment_to: Joi.date().required(),
    location: Joi.string().optional(),
    shop_name: Joi.string().required()
});

module.exports = {
    registerSeller
}