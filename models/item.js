const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    donate: {
        type: String,
        require: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    description: {
        type: String,
        require: true
    }
});

UserSchema.plugin(passportLocalMongoose);  //this will add field for userId and password.

module.exports = mongoose.model('Item', UserSchema);