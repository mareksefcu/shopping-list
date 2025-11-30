// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 30
    },
    state: {
        type: String,
        default: 'active'
    }
}, {
    timestamps: false
});

const User = mongoose.model('User', userSchema);

module.exports = User;

