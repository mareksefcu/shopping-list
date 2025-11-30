// models/ShoppingList.js

const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema({
    itemId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 255
    },
    quantity: {
        type: Number,
        default: 1,
        min: 0.1
    },
    unit: {
        type: String,
        default: 'ks'
    },
    done: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const shoppingListSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 500,
        default: null
    },
    ownerId: {
        type: String,
        required: true
    },
    memberIds: {
        type: [String],
        default: []
    },
    items: {
        type: [listItemSchema],
        default: []
    },
    createdAt: {
        type: String,
        required: true
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: false
});

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

module.exports = ShoppingList;

