// server.js

const express = require('express');
const app = express();
const authRouter = require('./controllers/authController');
const listRouter = require('./controllers/listController');

// Connect to MongoDB
require('./config/database');

// Middleware pro parsování JSON z těla požadavku
app.use(express.json()); 

// Připojení routerů na určené cesty
app.use('/auth', authRouter); // Endpoints: /auth/register, /auth/login
app.use('/list', listRouter); // Endpoints: /list, /list/:listId/items/:itemId, atd.

// Základní health check
app.get('/', (req, res) => {
    res.send('Shopping List Backend is running!');
});

// Export app for testing
module.exports = app;

const PORT = 3000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server bezi na http://localhost:${PORT}`));
}