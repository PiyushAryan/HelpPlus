const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const donateSchema = new Schema({
    donate: String,
    des: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

});

const Donate = mongoose.model('Donate', donateSchema);
module.exports = Donate;