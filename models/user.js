const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email: {
        type: String,
        require: true,
    },
    contact:{
        type:String,
        require:true
    }
});

UserSchema.plugin(passportLocalMongoose);  //this will add field for userId and password.
module.exports = mongoose.model('User', UserSchema);