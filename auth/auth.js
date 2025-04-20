const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

exports.generateAccessToken = (user) => {   // Takes an object [ jwt.sign() is synchronous ]
    const token = jwt.sign({username: user.username}, `${process.env.ACCESS_SECRET}`, {expiresIn: "15min"});
    return token;
}

exports.generateRefreshToken = (user) => {
    const token = jwt.sign({username: user.username}, `${process.env.REFRESH_SECRET}`);  // Omitting the expiresIn - - > Expirty time : Infinite
    return token;
}

exports.authenticateToken = async (req, res, next) => {       // Custom middleware
    let token = req.headers['authorization'];
    if (token) {
        console.log('\n== TOKEN ==\n', token);
        token = token.substring(7);  // Postman - - > Keep access token in Authorization - - > Bearer Token // Frontend will have to add it manually for API calls. Or, maybe we will have to store it in cookie as we did for Refresh Token
    }
    if (!token) {                    // My edit: If we don't get Access Token from req.headers, we try to get it from Cookies
        token = req.cookies.accessToken;
        console.log('\n== token ==\n', token);
        if (!token) {
            return res.status(401).json('Invalid token');
        }
    }
    jwt.verify(token, `${process.env.ACCESS_SECRET}`, async(error, decoded) => {
        if (error) {
            return res.status(403).json('Token Expired. Something went wrong.');
        }
        next();                     // If we reached here - - > Token is valid. Call the next middleware
    });
}