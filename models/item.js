const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const opts={toJSON:{virtuals:true}};

const donateSchema = new Schema({
    donate: String,
    des: String,
    location:String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: Boolean,
        default: false
    },
    doneeUsername:{
        type:String,   
    },
    doneeId:{
        type:String,
    }
},opts);
donateSchema.virtual('properties.popUpMarkup').get(function(){
    return `<p>${this.donate},${this.des}</p><strong><a href="/showDetails/${this.author}">Donor profile</a>`
})

const Donate = mongoose.model('Donate', donateSchema);
module.exports = Donate;