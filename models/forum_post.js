const { Schema, model } = require('mongoose');
const moment = require('moment-timezone');

const post = new Schema({
    author: {
        type: String,
        required: true
    },
    title: {
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
    },
    comments: {
        list: [
            {
                author: String,
                content: String,
                time: String
            }
        ]
    },
}, { timestamps: true });


module.exports = model('ForumPost', post);
