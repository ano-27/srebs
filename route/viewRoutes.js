const { Router } = require('express');
const viewController = require('./../controller/viewController.js');
const { authenticateToken } = require('../auth/auth.js');

const router = new Router();

router.get('/register', viewController.registerController);
router.get('/login', viewController.loginController);
// router.get('/profile', viewController.profileController);
router.get('/home', authenticateToken, viewController.homeController);

// Seller
router.get('/register-seller', viewController.registerSellerController);
router.get('/dashboard-index', authenticateToken, viewController.dashboardIndexController);
router.get('/dashboard/project', authenticateToken, viewController.dashboardProjectController);
router.get('/dashboard/return', authenticateToken, viewController.dashboardProjectControllerReturn);

// Customer
router.get('/cart', authenticateToken, viewController.cartController);
router.get('/history', authenticateToken, viewController.historyController);
// router.get('/historyDetail', authenticateToken, viewController.historyDetailController);
router.get('/history/:id', authenticateToken, viewController.getHistoryDetails);

// Others
router.get('/contact', viewController.contactController);

module.exports = router;