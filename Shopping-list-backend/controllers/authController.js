// controllers/authController.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { registerInSchema, loginInSchema } = require('../models/schemas');
const db = require('../database/mongodb'); 

const JWT_SECRET = 'your_super_secret_key'; // Stejný jako v authMiddleware

// --- POST /auth/register ---
router.post('/register', async (req, res) => {
    const { error, value: userData } = registerInSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ code: "auth/invalidDtoIn", message: "Validation error." });
    }

    try {
        if (await db.findUserByEmail(userData.email)) {
            return res.status(409).json({ code: "auth/emailAlreadyExists", message: "User with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUserId = uuidv4();
        
        await db.createUser({
            _id: newUserId,
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            state: "active"
        });

        // DTO Out
        return res.status(200).json({ 
            success: true, 
            userId: newUserId 
        });

    } catch (e) {
        return res.status(500).json({ code: "auth/serverError", message: "Server error during registration." });
    }
});

// --- POST /auth/login ---
router.post('/login', async (req, res) => {
    const { error, value: loginData } = loginInSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ code: "auth/invalidDtoIn", message: "Validation error." });
    }

    try {
        const user = await db.findUserByEmail(loginData.email);
        if (!user || !(await bcrypt.compare(loginData.password, user.password))) {
            return res.status(401).json({ code: "auth/invalidCredentials", message: "Invalid email or password." });
        }

        // Generování tokenu s platností 1h
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        // DTO Out
        return res.status(200).json({ 
            success: true, 
            userId: user._id,
            token: token
        });

    } catch (e) {
        return res.status(500).json({ code: "auth/serverError", message: "Server error during login." });
    }
});

module.exports = router;