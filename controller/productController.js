const { models, getSequelize } = require ('../models/index.js');  // Will be used to get the current value of sequelize, not the cached null reference
const { generateQRfunc } = require ('./qrController.js');

exports.registerProduct = async (req, res) => {
    const sequelize = getSequelize();   
    const dbTrans = await sequelize.transaction();
    if (req?.user?.role !== 'owner') {
        await dbTrans.rollback();
        return res.status(500).json({
            success: false,
            message: 'Seller authentication failed. Access denied.' 
        });
    }
    try {
        const { Product, Inventory, Shop } = models;
        let productData = { ...req?.body};
        delete productData.stock;

        const shopDetails = await Shop.findOne({    // One owner, one shop
            where: {
                owner_user_id: req?.user?.id
            }
        });

        productData.shop_id = shopDetails?.id;
        const addProduct = await Product.create(
            productData,
            { 
                transaction: dbTrans
            }
        );
        if (!addProduct) {
            await dbTrans.rollback();
            return res.status(500).json({
                success: false,
                message: 'Failed to register Product' 
            });
        }

        // Add initial stock
        const addInventory = await Inventory.create(
            {
                shop_id: shopDetails?.id,
                product_id: addProduct?.id,
                expiry: req?.body?.expiry,
                stock: req?.body?.stock
            },
            {
                transaction: dbTrans
            }
        );
        if (!addInventory) {
            await dbTrans.rollback();
            return res.status(500).json({
                success: false,
                message: 'Failed to register Product while adding Inventory' 
            });
        }

        // Generate QR for added Product
        const qr = await generateQRfunc({ product_id: addProduct?.id, product_name: addProduct?.name });
        if (!qr) {
            await dbTrans.rollback();
            return res.status(500).json({
                success: false,
                message: 'Failed to register Product due to error in QR code generation' 
            });
        }

        await dbTrans.commit();
        return res.status(200).json({
            success: true,
            message: `Product registration successful. Generated QR with name ${addProduct?.id}-${addProduct?.name}.png in public/qrcodes/ folder` 
        });
    } catch (e) {
        await dbTrans.rollback();
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.editProduct = async (req, res) => {
    if (req?.user?.role !== 'owner') {
        return res.status(500).json({
            success: false,
            message: 'Seller authentication failed. Access denied.' 
        });
    }
    try {
        const { Product, Shop } = models;
        
        const shopOfOwner = await Shop.findOne({
            where: {
                owner_user_id: req?.user?.id
            }
        });
        const shopOfProduct = await Product.findByPk(req?.params?.id);
        if (!shopOfOwner || !shopOfProduct || shopOfOwner?.id != shopOfProduct?.shop_id) {
            return res.status(400).json({
                success: false,
                message: 'Seller authentication failed for updation'
            });
        }

        const editProduct = await Product.update(
            req?.body,
            {
                where: {
                    id: req?.params?.id
                }
            }
        );
        if (!editProduct) {
            return res.status(500).json({
                success: false,
                message: 'Failed to edit Product' 
            });
        }
        return res.status(200).json({
            success: true,
            message: `Product edited successfully.` 
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

exports.editProductInventory = async (req, res) => {
    try {
        if (req?.user?.role !== 'owner') {
            return res.status(500).json({
                success: false,
                message: 'Seller authentication failed. Access denied.' 
            });
        }

        const { Inventory, Shop } = models;

        const shopOfOwner = await Shop.findOne({
            where: {
                owner_user_id: req?.user?.id
            }
        });
        const shopOfInventory = await Inventory.findByPk(req?.params?.id);
        if (!shopOfOwner || !shopOfInventory || shopOfOwner?.id != shopOfInventory?.shop_id) {
            return res.status(400).json({
                success: false,
                message: 'Seller authentication failed for updation'
            });
        }

        const editInventory = await Inventory.update(
            req?.body,
            {
                where: {
                    id: req?.params?.id
                }
            }
        );
        if (!editInventory) {
            return res.status(500).json({
                success: false,
                message: 'Failed to edit Inventory' 
            });
        }

        return res.status(200).json({
            success: true,
            message: `Inventory edited successfully.` 
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

exports.deleteProductInventory = async (req, res) => {
    const { Inventory, Shop } = models;
    try {
        if (req?.user?.role !== 'owner') {
            return res.status(400).json({
                success: false,
                message: 'Seller authentication failed'
            });
        }

        const shopOfOwner = await Shop.findOne({
            where: {
                owner_user_id: req?.user?.id
            }
        });
        const shopOfInventory = await Inventory.findByPk(req?.params?.id);
        if (!shopOfInventory || shopOfOwner?.id != shopOfInventory?.shop_id) {
            return res.status(400).json({
                success: false,
                message: 'Seller authentication failed for deletion'
            });
        }

        await Inventory.destroy({
            where: {
                id: req?.params?.id
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Deletion successful'
        });  
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

exports.getProductDetails = async (req, res) => {
    if (!req?.user || !req?.params?.id) {
        return res.status(500).json({
            success: false,
            message: 'Access denied.'
        });  
    }
    try {
        const { Product } = models;
        const productDetails = await Product.findOne({
            where: {
                id: req?.params?.id
            }
        });
        if (!productDetails) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch details'
            });  
        }
        return res.status(200).json({
            success: true,
            message: 'Details fetched successfully',
            product: productDetails
        }); 
    } catch (e) {
        console.log('getProductDetails API error: ', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// New batch of inventory (diff expiry) for the same product
exports.newBatchOfStock = async (req, res) => {
    if (req?.user?.role !== 'owner') {
        return res.status(500).json({
            success: false,
            message: 'Seller authentication failed. Access denied.' 
        });
    }
    try {
        const { Inventory, Shop, Product } = models;
        const shopOfOwner = await Shop.findOne({
            where: {
                owner_user_id: req?.user?.id
            }
        });
        const shopOfProduct = await Product.findByPk(req?.body?.product_id);
        if (!shopOfOwner || !shopOfProduct || shopOfOwner?.id != shopOfProduct?.shop_id) {
            return res.status(400).json({
                success: false,
                message: 'Seller authentication failed for new batch'
            });
        }

        if (!req?.body?.shop_id) {
            const shopDetails = await Inventory.findOne({
                where: {
                    product_id: req?.body?.product_id
                },
                attributes: ['shop_id']
            }); 
            req.body.shop_id = shopDetails?.shop_id;
        }
        await Inventory.create(
            {
                ...req?.body
            }
        );
        return res.status(200).json({
            success: true,
            message: `New batch of inventory added for the existing product` 
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

exports.deleteProduct = async (req, res) => {
    if (req?.user?.role !== 'owner') {
        return res.status(500).json({
            success: false,
            message: 'Seller authentication failed. Access denied.' 
        });
    }
    try {
        const { Product, Shop } = models;
        const shopOfOwner = await Shop.findOne({
            where: {
                owner_user_id: req?.user?.id
            }
        });
        const shopOfProduct = await Product.findByPk(req?.params?.id);
        if (!shopOfOwner || !shopOfProduct || shopOfOwner?.id != shopOfProduct?.shop_id) {
            return res.status(400).json({
                success: false,
                message: 'Seller authentication failed for deletion'
            });
        }
        await Product.destroy(
            {
                where: {
                    id: req?.params?.id
                }
            }
        );
        return res.status(200).json({
            success: true,
            message: `Product successfully deleted` 
        });
     } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });  
    }
}

exports.getInventoryDetails = async (req, res) => {
    if (!req?.user || !req?.params?.id) {
        return res.status(500).json({
            success: false,
            message: 'Access denied.'
        });  
    }
    try {
        const { Inventory } = models;
        const inventoryDetails = await Inventory.findOne({
            where: {
                id: req?.params?.id
            }
        });
        if (!inventoryDetails) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch details'
            });  
        }
        return res.status(200).json({
            success: true,
            message: 'Details fetched successfully',
            inventory: inventoryDetails
        }); 
    } catch (e) {
        console.log('getInventoryDetails API error: ', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}