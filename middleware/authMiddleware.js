const jwt = require('jsonwebtoken');

const User = require('../models/UserModel');

const protect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            token = req.headers.authorization.split(' ')[1];
            console.log("token ", token);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("decoded", decoded);
            req.header = await User.findById(decoded.id).select('-password');
            next();
        } 
        catch (error) {
            console.log(error);
            res.status(401).json({
                success: false,
                message: 'La sesión ha expirado'
            })
        }
    }

    if (!token){
        res.status(401).json({
            success: false,
            message: 'No esta autorizado, sin token'
        })
    }
}

module.exports = protect;