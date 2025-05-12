const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { models, getSequelize } = require ('../models/index.js');
dotenv.config();

exports.generateAccessToken = (user) => {   // Takes an object - - > jwt.sign() is synchronous 
    const token = jwt.sign(
        { 
            id: user?.id,
            email: user?.email,
            role: user?.role
        },
        `${ process.env.ACCESS_SECRET }`,
        { expiresIn: "15min" }
    );
    return token;
}

exports.generateRefreshToken = (user) => {
    const token = jwt.sign(
        {
            id: user?.id,
            email: user?.email,
            role: user?.role
        },
        `${process.env.REFRESH_SECRET}`
    );  // Omitting the expiresIn - - > Expirty time : Infinite
    return token;
}

// Middleware to verify access token. If access token is expired, and refresh token is valid, use refresh token to generate new access token
exports.authenticateToken = async (req, res, next) => {
    const { User } = models;
    let token = req.headers['authorization'];                                       // Frontend will have to add it
    if (token) {
        token = token.substring(7);
        console.log(`\n== Token from req.headers['authorization'] ==\n`, token);    
    } else if (!token) {                                                            // If we don't get Access Token from req.headers, we try to get it from Cookies
        token = req.cookies.accessToken;
        console.log(`\n== Token from req.cookies.accessToken ==\n`, token);
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        req.user = decoded;
        console.log('\nPassing req.user to next middleware via try block. \nreq.user:', req.user);
        next();
    } catch (e) {
        // Access token expired. Creating new from Refresh Token
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(403).json('Access denied. Please login again.');
        }
        try {
            const user = await User.findOne(
                {
                    where: {
                        refreshToken: refreshToken
                    }
                }
            );
            if (!user) {
                return res.status(403).json('Invalid refresh token');
            }
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
            const newAccessToken = jwt.sign(
                { 
                    id: decoded?.id,
                    email: decoded?.email,
                    role: decoded?.role
                },
                process.env.ACCESS_SECRET,
                { expiresIn: '15m' }
            );

            // Update cookie
            res.cookie('accessToken', newAccessToken, { httpOnly: true });
            req.user = decoded;
            console.log('\nPassing req.user to next middleware via catch block. \nreq.user:', req.user);
            next();
        } catch (e) {
            return res.status(403).json('Token refresh failed. Please login again.');
        }
    }
}