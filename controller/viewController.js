const dotenv = require('dotenv');
dotenv.config();

exports.registerController = async(req, res) => {
    res.render('pages/register');   // Handlebars by default searches in /root/views/ for files to be rendered
}

exports.loginController = async(req, res) => {
    res.render('pages/login');
}

exports.profileController = async(req, res) => {
    // res.render('profile');
}

exports.homeController = async(req, res) => {
    res.render('pages/home');
}

// Seller
exports.registerSellerController = async (req, res) => {
    res.render('pages/register-seller');
}

exports.dashboardIndexController = async (req, res) => {
    if (!req?.user || req?.user?.role !== 'owner') {
        return res.redirect('/pages/login');
    }
    res.render('pages/dashboard/dbo-index');
}

exports.dashboardProjectController = async (req, res) => {
    res.render('pages/dashboard/product-management');
}

exports.dashboardProjectControllerReturn = async (req, res) => {
    res.render('pages/dashboard/return');
}

// Others
exports.contactController = async (req, res) => {
    res.render('pages/contact');
}

// Customer
exports.cartController = async (req, res) => {
    res.render('pages/cart-management')
}

exports.historyController = async (req, res) => {
    res.render('pages/history')
}

exports.historyDetailController = async (req, res) => {
    res.render('pages/history-detail');
}

exports.getHistoryDetails = async (req, res) => {
    try {
        const historyId = req?.params?.id;
        const response = await fetch(`${process.env.BASE_URL || 'http://localhost:8081'}/api/transaction/${historyId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': req.headers.cookie || ''
            },
            // credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            res.render('pages/history-detail.handlebars', {
                layout: 'main.handlebars',
                data: data
            });
        } else {
            res.redirect('/home');
        }
    } catch (err) {
        console.log(err);
        res.redirect('/home');
    }
}