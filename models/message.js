const { Schema, model } = require('mongoose');
const moment = require('moment-timezone');

const post = new Schema({
    sender: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    lastEditTime: {
        type: String,
        default: 0
    }
}, { timestamps: true });


module.exports = model('Message', post);
