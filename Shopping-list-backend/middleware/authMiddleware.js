// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const db = require('../database/mongodb'); 

const JWT_SECRET = 'your_super_secret_key'; 

// 1. Middleware pro Autentizaci (ověření tokenu)
function authenticateUser(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ code: "auth/missingToken", message: "Authentication token is missing." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId; 
        next();
    } catch (e) {
        return res.status(401).json({ code: "auth/invalidToken", message: "Invalid or expired token." });
    }
}

// 2. Funkce pro Autorizaci (kontrola rolí Zakladatel/Uživatel)
async function authorizeListAccess(listId, userId, roleRequired) {
    const list = await db.findListById(listId);

    if (!list) {
        throw new Error("ListNotFound");
    }

    const isOwner = list.ownerId.toString() === userId.toString();

    if (roleRequired === 'owner') {
        if (!isOwner) {
            throw new Error("Forbidden - OwnerAccessRequired"); 
        }
    } else if (roleRequired === 'member') { // Pro Zakladatele i Uživatele (členy)
        const isMember = list.memberIds.some(memberId => memberId.toString() === userId.toString());
        if (!isOwner && !isMember) {
            throw new Error("Forbidden - MemberAccessRequired");
        }
    }
    
    return list; // Vracíme list pro další zpracování
}

module.exports = {
    authenticateUser,
    authorizeListAccess
};