const { Router } = require('express');

const { reqValidator } = require('../middleware/reqValidator.js');

const productSchema = require('../validation/product.js');
const cartSchema = require('../validation/cart.js');
const shopSchema = require('../validation/shop.js');

const userController = require('../controller/userController.js');
const paymentController = require('../controller/paymentController.js');
const productController = require('../controller/productController.js');
const qrController = require('../controller/qrController.js');
const cartController = require('../controller/cartController.js');
const shopController = require('../controller/shopController.js');

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

// Shop
router.post('/register-as-seller', reqValidator(shopSchema.registerSeller), shopController.registerSeller);  // Sign up user as 'owner' and populate Shop table

// Product and Inventory : Check role = 'owner'
router.post('/register-product', authenticateToken, reqValidator(productSchema.registerProduct), productController.registerProduct);
router.patch('/edit-product/:id', authenticateToken, reqValidator(productSchema.editProduct), productController.editProduct);
router.patch('/edit-inventory/:id', authenticateToken, reqValidator(productSchema.editProductInventory), productController.editProductInventory);
router.post('/product-batch', authenticateToken, reqValidator(productSchema.newBatchOfStock), productController.newBatchOfStock);
router.delete('/delete-product/:id', authenticateToken, productController.deleteProduct);

// Cart : Check role = 'customer'
router.post('/add-to-cart', reqValidator(cartSchema.addToCart), cartController.addToCart);
router.delete('/remove-from-cart', cartController.removeFromCart);
router.delete('/empty-cart', cartController.emptyCart);
router.post('/cart-checkout', cartController.checkoutFromCart);

module.exports = router;