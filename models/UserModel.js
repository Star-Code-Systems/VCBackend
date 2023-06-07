const mongoose = require('mongoose');
const bycrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: 'string',
            requied: true
        },
        email: {
            type: 'string',
            requied: true,
            unique: true
        },
        password: {
            type: 'string',
            requied: true
        },
        avatar: {
            type: 'string',
            default: ''
        },
        active: {
            type: Boolean,
            default: false
        },
        activeToken: String,
        activeExpires: Date
    }
)

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bycrypt.compare(enteredPassword, this.password);
}

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }

    const salt = await bycrypt.genSalt(10);
    this.password =  await bycrypt.hash(this.password, salt);
})

module.exports = mongoose.model('User', userSchema);