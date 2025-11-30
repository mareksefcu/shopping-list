// database/mongodb.js
// MongoDB implementation replacing database_mock.js

const User = require('../models/User');
const ShoppingList = require('../models/ShoppingList');

// User operations
async function findUserByEmail(email) {
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        return user ? user.toObject() : null;
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    }
}

async function createUser(userData) {
    try {
        const user = new User(userData);
        await user.save();
        return user.toObject();
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// ShoppingList operations
async function findListById(listId) {
    try {
        const list = await ShoppingList.findById(listId);
        return list ? list.toObject() : null;
    } catch (error) {
        console.error('Error finding list by id:', error);
        throw error;
    }
}

async function findListsByUserId(userId) {
    try {
        const lists = await ShoppingList.find({
            $or: [
                { ownerId: userId },
                { memberIds: userId }
            ],
            isArchived: false
        }).sort({ createdAt: -1 });
        return lists.map(list => list.toObject());
    } catch (error) {
        console.error('Error finding lists by user id:', error);
        throw error;
    }
}

async function saveList(listData) {
    try {
        const list = new ShoppingList(listData);
        await list.save();
        return list.toObject();
    } catch (error) {
        console.error('Error saving list:', error);
        throw error;
    }
}

async function updateListDocument(listId, updateData) {
    try {
        const list = await ShoppingList.findByIdAndUpdate(
            listId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        if (!list) {
            throw new Error('ListNotFound');
        }
        return list.toObject();
    } catch (error) {
        console.error('Error updating list:', error);
        throw error;
    }
}

async function deleteList(listId) {
    try {
        const result = await ShoppingList.findByIdAndDelete(listId);
        return result ? result.toObject() : null;
    } catch (error) {
        console.error('Error deleting list:', error);
        throw error;
    }
}

module.exports = {
    findUserByEmail,
    createUser,
    findListById,
    findListsByUserId,
    saveList,
    updateListDocument,
    deleteList
};


