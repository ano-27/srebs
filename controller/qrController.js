const QRCode = require('qrcode');           // Used to Generate QR
const multer = require('multer');
const Jimp = require('jimp');
const QrReader = require('qrcode-reader');  // Used to Read QR
const path = require('path');
const fs = require('fs');

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

}