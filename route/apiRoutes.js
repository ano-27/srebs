const { Router } = require('express');

const { reqValidator } = require('../middleware/reqValidator.js');

const productSchema = require('../validation/product.js');
const cartSchema = require('../validation/cart.js');

const userController = require('../controller/userController.js');
const paymentController = require('../controller/paymentController.js');
const productController = require('../controller/productController.js');
const qrController = require('../controller/qrController.js');
const cartController = require('../controller/cartController.js');

const { authenticateToken } = require('../auth/auth.js');

const router = Router();  // Instance of Router class
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/register', userController.registerController);
router.post('/login', userController.loginController);
router.post('/refreshtoken', userController.refreshController);
router.post('/logout', userController.logoutController);
router.post('/profile', authenticateToken, userController.profileController);

router.post('/createOrder', paymentController.createOrder);
router.get('/checkout', paymentController.checkoutPage);
router.post('/verifyPayment', paymentController.verifyPayment);

router.post('/generate-qr', qrController.generateQR);   // authenticate-owner middleware in future
router.post('/read-qr', upload.single('qrImage'), qrController.readQR);

router.get('/qr-options/:product_id', qrController.qrOptions);

// Product and Inventory : checkOwner middleware required later
router.post('/register-product', authenticateToken, reqValidator(productSchema.registerProduct), productController.registerProduct);
router.patch('/edit-product/:id', reqValidator(productSchema.editProduct), productController.editProduct);
router.patch('/edit-inventory/:id', reqValidator(productSchema.editProductInventory), productController.editProductInventory);
router.post('/product-batch', reqValidator(productSchema.newBatchOfStock), productController.newBatchOfStock);
router.delete('/delete-product/:id', productController.deleteProduct);

// Cart : checkCustomer middleware required later
router.post('/add-to-cart', reqValidator(cartSchema.addToCart), cartController.addToCart);
router.delete('/remove-from-cart', cartController.removeFromCart);
router.delete('/empty-cart', cartController.emptyCart);
router.post('/cart-checkout', cartController.checkoutFromCart);

module.exports = router;