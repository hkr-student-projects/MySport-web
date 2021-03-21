const { Schema, model } = require('mongoose');

const token = new Schema({
    email: String,
    value: String,
    expiration: Date
}, {
    timestamps: true
});

module.exports = model('Token', token);