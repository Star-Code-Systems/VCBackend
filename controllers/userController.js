const User = require('../models/UserModel');
var mailer = require('../utils/Mailer');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

const registerUser = async (req,res,next) => {
    try{
        const {name, email, password} = req.body;
        const userExists = await User.findOne({ email });

        if (userExists && userExists.active){
            return res.status(400).json({
                success: false,
                message: 'Ya existe el id del email. Inicia sesión para continuar'
            })
        }
        else if (userExists && !userExists.active){
            return res.status(400).json({
                success: false,
                message: 'Cuenta creada pero requiere verificación. Un link fue enviado a su email.'
            })
        }

        const user = new User({
            name, email, password
        });

        // Generate 20 bit activation code, crypto is built in package of nodejs
        crypto.randomBytes(20, function (error, buffer){

            //Ensure the activation token is unique
            user.activeToken = user._id + buffer.toString('hex');

            // Set expiration time is 24 hours
            user.activeExpires = Date.now() + 24 * 3600 * 1000;
            var link = process.env.NODE_ENV == 'development' ? `http://localhost:${process.env.PORT}/api/users/active/${user.activeToken}`
                : `${process.env.api_host}/api/users/active/${user.activeToken}`;

            // Sending activation mail
            mailer.send({
                to: req.body.email,
                subject: '¡Te damos la bienvenida a Virtual Caddie!',
                html: 'Porfavor haz click <a href="' + link + '">aquí</a> para activar tu cuenta.'
            });

            // Save user object
            user.save()
            .then(() => {
                res.status(201).json({
                    success: true,
                    message: 'El link de activación ha sido enviado a ' + user.email + ', Por haz click en el link dentro de las próximas 24 horas'
                })
              })
              .catch((err) => {
                next(err);
                console.log(err);
              });
        })

    }  catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'El servidor está teniendo problemas.'
        })
    }
};


const activeToken = async (req, res, next) => {
    // find the corresponding user
    try {
        const user = await User.findOne({
            activeToken: req.params.activeToken,
            activeExpires: { $gt: Date.now() }
        }).exec();
    
        // If invalid activation code
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'La liga de activación es inválida.'
            });
        }
    
        if (user.active === true) {
            return res.status(200).json({
                success: true,
                message: 'Tu cuenta ya ha sido activada, inicia sesión para ingresar a la app.'
            });
        }
    
        // If not activated, activate and save
        user.active = true;
        await user.save();
    
        // Activation success
        res.json({
            success: true,
            message: 'Activación exitosa'
        });
    } catch (err) {
        next(err);
    }    
};

const authUser = async (req, res, next) => {
    const {email, password} = req.body;

    const user = await User.findOne({ email });

    if(user && (await user.matchPassword(password))){
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id)
        })
    } else {
        res.status(401).json({
            success: false,
            message: 'Usuario no autorizado'
        })
    }
};

const logout = async (req, res, next) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
    });
    res.status(200).json({ status: 'success' });
};

const getMe = async (req, res) => {
    const user = await User.findById(req.header._id);

    if(user){
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        })
    } else {
        res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        })
    }
}

const updateMe = async (req, res) => {
    const user = await User.findById(req.header._id);

    if(user){
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.avatar = req.body.avatar || user.avatar;

        const updateUser = await user.save();

        res.json({
            _id: updateUser.id,
            name: updateUser.name,
            email: updateUser.email,
            avatar: updateUser.avatar,
            token: generateToken(updateUser._id)
        })
    } else {
        res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        })
    }
}


module.exports = {
    registerUser,
    activeToken,
    authUser,
    getMe,
    updateMe,
    logout
}