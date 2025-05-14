const { models } = require ('../models/index.js');  /* NOTE: Because of 'require' even though models is imported before the db conncn and is null,
                                                             When the conncn and everything is done, we can access updated values inside it,
                                                             Because, since its an object, when we import it, we are importing via reference, which will refer to (updated) object and not its static value */
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../auth/auth.js');

exports.registerController = async(req, res) => {
    try {
        const { User } = models;
        const { email, password } = req.body;
        const existUser = await User.findOne({ where: { email: email } });  // Check if user exists with same email
        if (existUser) {
            return res.status(409).json("Email in use. Kindly use another email.");
        } else {
            const hashedPass = await bcryptjs.hash(password, 10);
            const createUser = await User.create({
                ...req.body,           // Spread contents of an obj inside another obj
                password: hashedPass   // Overwrites value of 'password' key of object from 'req.body.password' to 'hashedPass' // An object  has unique keys
            });
            return res.status(201).json({
                message: "Registration successful.",
                userData: {
                    id: createUser.id,
                    email: createUser.email
                }
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(502).json('INTERNAL SERVER ERROR');
    }
}

// Login: Return refreshToken, accessToken. Also update refreshToken in User Database and store in Client cookie    // My edit: Also store Access Token in Client cookie
exports.loginController = async(req, res) => {
    try {
        const { User } = models; 
        const { email, password } = req.body;
        const checkUser = await User.findOne(
            {
                where: {
                    email: email
                }
            }
        ); // checkUser will now contain the user record (as a Sequelize model instance) if found, or null if not.

        if (!checkUser) {
            return res.status(401).json({
                success: false,
                message: 'Email does not exist. New User? Pls Sign Up'
            });
        }
        const isValid = await bcryptjs.compare(password, checkUser?.password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }
        const accessToken = generateAccessToken(checkUser);     // Sequelize by default performs - - > .toJSON() - - > which only returns the 'dataValues' part of the Sequelize object as response
        const refreshToken = generateRefreshToken(checkUser);
        await checkUser.update({refreshToken: refreshToken});   // We can update that row like this as well. Updates refreshToken for the record when we login

        res.cookie("refreshToken", refreshToken, {httpOnly: true, secure: true});  // Store refreshToken in client's cookie. httpOnly: true - - > Client can't use JS to get that refreshToken from cookie and secure: true - - > allow only HTTPS connections
        res.cookie("accessToken", accessToken, {httpOnly: true, secure: true});
        // res.clearCookie("refreshToken"); // To clear the cookie - - > We pass the name in string and the val of the object gets deleted
        
        return res.status(200).json({
            message: 'Signed in successfully.',
            userData : {
                user_id: checkUser.dataValues.id,
                email: checkUser.dataValues.email,
                role: checkUser.dataValues.role,
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: 'INTERNAL ERROR'
        });
    }
}

// << NOT IN USE >>: Function to generate Access Token from Refresh Token stored in Client's cookie // My edit: Also store new access token in cookie
exports.refreshController = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;  // Requesting refreshToken from Client's cookie
    try {
        const { User } = models;
        if (!refreshToken) {
            return res.status(403).json('Refresh Token is empty');
        }
        const user = await User.findOne({where: {refreshToken: refreshToken}});
        jwt.verify(refreshToken, 'cdef-this-is-also-secret-key', async(error, decoded) => {  // Verify the Refresh Token
            if (error) {
                return res.status(403).json('Error in verifying Refresh Token');
            }
            const accessToken = generateAccessToken(user.dataValues);
            res.cookie('accessToken', accessToken, {httpOnly: true, secure: true});
            return res.status(200).json({
                accessToken: accessToken
            });
        });   
    } catch (e) {
        return res.status(500).json('Internal Error');
    }
}

// Logout: Clear refreshToken, accessToken from cookie and clear refreshToken from User database
exports.logoutController = async(req, res) => {
    try {
        const { User } = models;
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(403).json('Token is empty');
        }
        const user = await User.findOne(
            {
                where: {
                    refreshToken: refreshToken
                }
            }
        );
        if (user) {
            await user.update(
                { refreshToken: null }
            );
        }
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        return res.status(200).json('Logout successful');
    } catch (e) {
        console.log(e);
        return res.status(500).json('Internal server error');
    }
}

exports.profileController = async(req, res) => {
    return res.status(200).json({
        username: 'sample username',
        email: 'sample email'
    });
}