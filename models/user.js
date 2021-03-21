const { Schema, model } = require('mongoose');

const user = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    personal_number: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    user_type: {
        type: Number,
        default: 1
    },
    key_number: {
        type: String,
        required: false
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    resetToken: String,
    tokenExpiration: Date
}, {
    timestamps: true
});

module.exports = model('User', user);