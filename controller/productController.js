const { models, getSequelize } = require ('../models/index.js');  // Will be used to get the current value of sequelize, not the cached null reference
const { generateQRfunc } = require ('./qrController.js');

exports.registerProduct = async (req, res) => {
    const sequelize = getSequelize();   
    const dbTrans = await sequelize.transaction();
    if (req?.user?.role !== 'owner') {
        return res.status(500).json({
            success: false,
            message: 'Seller authentication failed. Access denied.' 
        });
    }
    console.log('\n req.user register product api', req.user);
    try {
        const { Product, Inventory } = models;
        let productData = { ...req?.body};
        delete productData.stock;

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
                shop_id: req?.body?.shop_id,
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
    const sequelize = getSequelize();   
    const dbTrans = await sequelize.transaction();
    if (req?.user?.role !== 'owner') {
        return res.status(500).json({
            success: false,
            message: 'Seller authentication failed. Access denied.' 
        });
    }
    try {
        const { Product } = models;
        const checkProduct = await Product.findByPk(req?.params?.id);
        if (!checkProduct) {
            return res.status(500).json({
                success: false,
                message: 'Product not found'
            });
        }
        const editProduct = await Product.update(
            req?.body,
            {
                where: {
                    id: product_id
                }
            },
            { 
                transaction: dbTrans
            }
        );
        if (!editProduct) {
            await dbTrans.rollback();
            return res.status(500).json({
                success: false,
                message: 'Failed to edit Product' 
            });
        }

        await dbTrans.commit();
        return res.status(200).json({
            success: true,
            message: `Product edited successfully.` 
        });
    } catch (e) {
        await dbTrans.rollback();
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

exports.editProductInventory = async (req, res) => {
    if (req?.user?.role !== 'owner') {
        return res.status(500).json({
            success: false,
            message: 'Seller authentication failed. Access denied.' 
        });
    }
    const sequelize = getSequelize();   
    const dbTrans = await sequelize.transaction();
    try {
        const { Inventory } = models;
        const checkInventory = await Inventory.findByPk(req?.params?.id);
        if (!checkInventory) {
            return res.status(500).json({
                success: false,
                message: 'Inventory not found'
            });
        }
        const editInventory = await Inventory.update(
            req?.body,
            {
                where: {
                    id: req?.params?.id
                }
            },
            { 
                transaction: dbTrans
            }
        );
        if (!editInventory) {
            await dbTrans.rollback();
            return res.status(500).json({
                success: false,
                message: 'Failed to edit Inventory' 
            });
        }

        await dbTrans.commit();
        return res.status(200).json({
            success: true,
            message: `Inventory edited successfully.` 
        });
    } catch (e) {
        await dbTrans.rollback();
        console.log(e);
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
    const sequelize = getSequelize();   
    const dbTrans = await sequelize.transaction();
    try {
        const { Inventory } = models;
        const addInventory = await Inventory.create(
            {
                ...req?.body
            },
            {
                transaction: dbTrans
            });
        if (!addInventory) {
            await dbTrans.rollback();
            return res.status(500).json({
                success: false,
                message: 'Failed to add inventory'
            });
        }
        await dbTrans.commit();
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
    const sequelize = getSequelize();
    const dbTrans = await sequelize.transaction();
    try {
        const { Product } = models;
        const checkProduct = await Product.findByPk(req?.params?.id);
        if (!checkProduct) {
            await dbTrans.rollback();
            return res.status(500).json({
                success: false,
                message: 'Product not found'
            });  
        }
        const delProduct = await Product.destroy(
            {
                where: {
                    id: req?.params?.id
                }
            },
            {
                transaction: dbTrans
            }
        );
        if (!delProduct) {
            await dbTrans.rollback();
            return res.status(500).json({
                success: false,
                message: 'Failed to delete product'
            });  
        }
        await dbTrans.commit();
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

exports.productList = async (req, res) => {
    const { Shop, Product } = models;
    const shopDetails = await Shop.findOne({
        where: {
            owner_user_id: req?.user?.id 
        }
    });
    const products = await Product.findAll({
        where: {
            shop_id: shopDetails?.id
        }
    });
    return products;
}