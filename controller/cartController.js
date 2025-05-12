/*

APIs that we might need

addToCart
removeFromCart
emptyCart
checkoutFromCart

*/

exports.addToCart = async (req, res) => {
    const sequelize = getSequelize();   
    const dbTrans = await sequelize.transaction();
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

exports.removeFromCart = async (req, res) => {

}

exports.emptyCart = async (req, res) => {

}

exports.checkoutFromCart = async (req, res) => {

}