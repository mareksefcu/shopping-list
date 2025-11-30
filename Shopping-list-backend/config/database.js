// config/database.js

const mongoose = require('mongoose');

// MongoDB connection string - can be set via environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-list';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});

module.exports = mongoose;


