// controllers/listController.js

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticateUser, authorizeListAccess } = require('../middleware/authMiddleware');
const { createListInSchema, patchItemInSchema, addMemberInSchema, updateListInSchema } = require('../models/schemas');
const db = require('../database/mongodb'); 

// Všechny routy v tomto kontroleru používají autentizaci
router.use(authenticateUser);

// --- GET /list (Seznam všech nákupních listů) - shoppingList/list ---
router.get('/', async (req, res) => {
    try {
        const lists = await db.findListsByUserId(req.userId);
        
        // DTO Out - zjednodušený výstup
        const listsOutput = lists.map(list => ({
            listId: list._id,
            name: list.name,
            description: list.description,
            ownerId: list.ownerId,
            itemsCount: list.items.length,
            createdAt: list.createdAt,
            isArchived: list.isArchived
        }));
        
        return res.status(200).json({ 
            result: "ok",
            lists: listsOutput 
        });
    } catch (e) {
        return res.status(500).json({ code: "list/serverError", message: "Internal server error." });
    }
});

// --- GET /list/:listId (Získat jeden nákupní list) - shoppingList/get ---
router.get('/:listId', async (req, res) => {
    const { listId } = req.params;
    
    try {
        // Autorizace: Musí být Zakladatel nebo Uživatel/Člen
        const list = await authorizeListAccess(listId, req.userId, 'member');
        
        // DTO Out
        return res.status(200).json({
            result: "ok",
            list: {
                listId: list._id,
                name: list.name,
                description: list.description,
                ownerId: list.ownerId,
                memberIds: list.memberIds,
                items: list.items,
                createdAt: list.createdAt,
                isArchived: list.isArchived
            }
        });
    } catch (e) {
        if (e.message.startsWith('Forbidden') || e.message === 'ListNotFound') {
            return res.status(403).json({ code: e.message, message: "Access denied or list not found." });
        }
        return res.status(500).json({ code: "list/serverError", message: "Internal server error." });
    }
});

// --- POST /list (Vytvořit nákupní list) - shoppingList/create ---
router.post('/', async (req, res) => {
    const { error, value: listData } = createListInSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ code: "list/invalidDtoIn", message: "Validation error." });
    }
    
    try {
        const newListId = uuidv4();
        const now = new Date().toISOString();

        // 1. Zpracování a mapování položek na vnořenou strukturu
        const itemsWithId = listData.items.map(item => ({
            itemId: uuidv4(),
            ...item,
            done: false // Nová položka je vždy nedokončená
        }));

        const newList = {
            _id: newListId,
            name: listData.name,
            description: listData.description || null,
            ownerId: req.userId, // Autorizace! Vlastník je uživatel z tokenu
            memberIds: [],
            items: itemsWithId,
            createdAt: now,
            isArchived: false
        };

        await db.saveList(newList);

        // DTO Out
        return res.status(200).json({ 
            listId: newListId,
            name: newList.name,
            ownerId: newList.ownerId,
            itemsCount: newList.items.length
        });

    } catch (e) {
        return res.status(500).json({ code: "list/serverError", message: "Internal server error." });
    }
});

// --- PATCH /list/:listId/items/:itemId (Upravit položku) ---
// Autorizace: member
router.patch('/:listId/items/:itemId', async (req, res) => {
    const { listId, itemId } = req.params;
    const { error, value: updateData } = patchItemInSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ code: "list/invalidDtoIn", message: "Validation error." });
    }
    
    try {
        // Autorizace: Musí být Zakladatel nebo Uživatel/Člen
        let list = await authorizeListAccess(listId, req.userId, 'member');

        const itemIndex = list.items.findIndex(i => i.itemId === itemId);
        if (itemIndex === -1) {
             return res.status(404).json({ code: "list/itemNotFound", message: "Shopping item not found in list." });
        }
        
        // Aktualizace a uložení
        const updatedItem = { ...list.items[itemIndex], ...updateData };
        list.items[itemIndex] = updatedItem;

        await db.updateListDocument(listId, { items: list.items });
        
        return res.status(200).json({ result: "ok", item: updatedItem });

    } catch (e) {
        if (e.message.startsWith('Forbidden') || e.message === 'ListNotFound') {
             return res.status(403).json({ code: e.message, message: "Access denied or list not found." });
        }
        return res.status(500).json({ code: "list/serverError", message: "Internal server error." });
    }
});

// --- PUT /list/:listId (Upravit nákupní list) - shoppingList/update ---
router.put('/:listId', async (req, res) => {
    const { listId } = req.params;
    const { error, value: updateData } = updateListInSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({ code: "list/invalidDtoIn", message: "Validation error." });
    }
    
    try {
        // Autorizace: Povoleno pouze Zakladateli
        await authorizeListAccess(listId, req.userId, 'owner');
        
        const updatedList = await db.updateListDocument(listId, updateData);
        
        // DTO Out
        return res.status(200).json({
            result: "ok",
            list: {
                listId: updatedList._id,
                name: updatedList.name,
                description: updatedList.description,
                ownerId: updatedList.ownerId,
                itemsCount: updatedList.items.length,
                isArchived: updatedList.isArchived
            }
        });
    } catch (e) {
        if (e.message.startsWith('Forbidden') || e.message === 'ListNotFound') {
            return res.status(403).json({ code: e.message, message: "Access denied or list not found." });
        }
        return res.status(500).json({ code: "list/serverError", message: "Internal server error." });
    }
});

// --- DELETE /list/:listId (Smazat nákupní list) - shoppingList/delete ---
router.delete('/:listId', async (req, res) => {
    const { listId } = req.params;
    
    try {
        // Autorizace: Povoleno pouze Zakladateli
        await authorizeListAccess(listId, req.userId, 'owner');
        
        const deletedList = await db.deleteList(listId);
        
        if (!deletedList) {
            return res.status(404).json({ code: "list/listNotFound", message: "List not found." });
        }
        
        return res.status(200).json({ 
            result: "ok", 
            message: `List ${listId} deleted successfully.` 
        });
    } catch (e) {
        if (e.message.startsWith('Forbidden') || e.message === 'ListNotFound') {
            return res.status(403).json({ code: e.message, message: "Access denied or list not found." });
        }
        return res.status(500).json({ code: "list/serverError", message: "Internal server error." });
    }
});

// --- DELETE /list/:listId/members/:memberId (Odebrat uživatele) ---
// Autorizace: owner
router.delete('/:listId/members/:memberId', async (req, res) => {
    const { listId, memberId } = req.params;
    
    try {
        // Autorizace: Povoleno pouze Zakladateli
        let list = await authorizeListAccess(listId, req.userId, 'owner');

        // Nelze odebrat vlastníka
        if (list.ownerId.toString() === memberId.toString()) {
             return res.status(400).json({ code: "list/cannotRemoveOwner", message: "Cannot remove the list owner." });
        }
        
        const initialMembersCount = list.memberIds.length;
        const newMemberIds = list.memberIds.filter(id => id.toString() !== memberId.toString());

        if (newMemberIds.length === initialMembersCount) {
             return res.status(404).json({ code: "list/memberNotFound", message: "The specified member is not in this list." });
        }

        await db.updateListDocument(listId, { memberIds: newMemberIds });
        
        return res.status(200).json({ result: "ok", message: `User ${memberId} removed.` });

    } catch (e) {
        if (e.message.startsWith('Forbidden') || e.message === 'ListNotFound') {
             return res.status(403).json({ code: e.message, message: "Access denied." });
        }
        return res.status(500).json({ code: "list/serverError", message: "Internal server error." });
    }
});

module.exports = router;