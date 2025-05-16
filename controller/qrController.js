const QRCode = require('qrcode');           // Used to Generate QR
const multer = require('multer');
const { Jimp } = require('jimp');
const QrReader = require('qrcode-reader');  // Used to Read QR
const path = require('path');
const fs = require('fs');
// const Product = require('./../models/Product')
const { models } = require ('../models/index.js'); 

exports.generateQRfunc = async (obj) => {
    try {
        let obj2 = { ...obj };
        delete obj2.product_name;
        const jsonData = JSON.stringify(obj2);
        const qrDataURL = await QRCode.toDataURL(jsonData);     // Generates a QR code and returns it as a base64-encoded data URL
        const fileName = `public/qrcodes/${ obj?.product_id }-${obj?.product_name}.png`;
        const qrImage = qrDataURL.replace(/^data:image\/png;base64,/, "");

        if (!fs.existsSync('public/qrcodes')) {
            fs.mkdirSync('public/qrcodes', { recursive: true });
        }

        fs.writeFileSync(fileName, qrImage, 'base64');
        return qrDataURL;

    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.generateQR = async (req, res) => {
    try {
        const productData = req.body;
        const jsonData = JSON.stringify(productData);
        const qrDataURL = await QRCode.toDataURL(jsonData);     // Generates a QR code and returns it as a base64-encoded data URL
        
        const fileName = `public/qrcodes/${productData.product_id}.png`;
        const qrImage = qrDataURL.replace(/^data:image\/png;base64,/, "");

        if (!fs.existsSync('public/qrcodes')) {
            fs.mkdirSync('public/qrcodes', { recursive: true });
        }

        fs.writeFileSync(fileName, qrImage, 'base64');

        return res.json({ 
            qrCode: qrDataURL, 
            filePath: `/qrcodes/${productData.product_id}.png` 
        });

    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

exports.readQR = async (req, res) => {
    try {
        // Check if the request contains a file
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }
        console.log('\nFile path: ', req.file.path);
        // Read the uploaded image
        const image =  await Jimp.read(req.file.path);

        // Create QR reader instance
        const qr = new QrReader();

        // Decode the QR code (using Promise)
        const result = await new Promise((resolve, reject) => {
            qr.callback = (err, value) => {
                if (err) reject(err);
                else resolve(value);
            };
            qr.decode(image.bitmap);
        });

        // Return the decoded data
        // return res.json({ 
        //     success: true, 
        //     data: JSON.parse(result.result)
        // });

        const decodedData = JSON.parse(result.result);
        console.log('\nDecoded info: ', decodedData);
        return res.json({ success: true, data: decodedData });

        } catch (error) {
            // console.error("QR read error:", error);
            return res.status(500).json({ error: error.message });
        }
}

exports.qrOptions = async (req, res) => {
    const { Product } = models;
    const { product_id } = req.params;
    const productDetails = await Product.findOne({ where: { id: product_id } });
    console.log('\nproductDetails', productDetails);
    res.render('pages/qrOptions', {
        product: { 
            id: productDetails?.id,
            name: productDetails?.name,
            price: productDetails?.price
        }
    });
}