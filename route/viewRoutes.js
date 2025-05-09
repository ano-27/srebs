const { Router } = require('express');
const viewController = require('./../controller/viewController.js');

const router = new Router();

router.get('/register', viewController.registerController);
router.get('/login', viewController.loginController);
router.get('/profile', viewController.profileController);
router.get('/home', viewController.homeController);

module.exports = router;