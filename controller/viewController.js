exports.registerController = async(req, res) => {
    res.render('register');   // Handlebars by default searches in /root/views/ for files to be rendered
}

exports.loginController = async(req, res) => {
    res.render('login');
}

exports.profileController = async(req, res) => {
    res.render('profile');
}

exports.homeController = async(req, res) => {
    res.render('home');
}