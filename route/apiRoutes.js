const { Router } = require('express');
const userController = require('../controller/userController.js');
const paymentController = require('../controller/paymentController.js');
const qrController = require('../controller/qrController.js');
const { authenticateToken } = require('../auth/auth.js');

const router = Router();  // Instance of Router class

router.post('/register', userController.registerController);
router.post('/login', userController.loginController);
router.post('/refreshtoken', userController.refreshController);
router.post('/logout', userController.logoutController);
router.post('/profile', authenticateToken, userController.profileController);

router.post('/createOrder', paymentController.createOrder);
router.get('/checkout', paymentController.checkoutPage);
router.post('/verifyPayment', paymentController.verifyPayment);

router.post('/generate-qr', qrController.generateQR);   // authenticate-owner middleware in future
router.post('/read-qr', qrController.readQR);

module.exports = router;