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
    res.render('pages/dashboard/project-management');
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