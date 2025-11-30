// models/schemas.js

const Joi = require('joi');

// --- Schémata pro Autentizaci ---

// 1. Registrace (/auth/register) - dtoln
const registerInSchema = Joi.object({
    email: Joi.string().email().max(30).required(),
    password: Joi.string().max(30).min(6).required(),
    name: Joi.string().max(30).required()
});

// 2. Přihlášení (/auth/login) - dtoln
const loginInSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// --- Schémata pro Listy ---

// 3. Schéma pro vnořenou položku
const listItemSchema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    quantity: Joi.number().min(0.1).optional().default(1),
    unit: Joi.string().optional().default('ks')
});

// 4. Vytvoření Listu (POST /list) - dtoln
const createListInSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    items: Joi.array().items(listItemSchema).optional().default([])
});

// 5. Úprava položky (PATCH /list/:listId/items/:itemId) - dtoln
const patchItemInSchema = Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    quantity: Joi.number().min(0.1).optional(),
    unit: Joi.string().optional(),
    done: Joi.boolean().optional() // Klíčové pro odškrtnutí
}).min(1);

// 6. DTO pro přidání člena (POST /list/:listId/members)
const addMemberInSchema = Joi.object({
    memberEmail: Joi.string().email().required()
});

// 7. Úprava Listu (PUT /list/:listId) - shoppingList/update
const updateListInSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional().allow(null),
    isArchived: Joi.boolean().optional(),
    items: Joi.array().items(listItemSchema.extend({
        itemId: Joi.string().required(),
        done: Joi.boolean().optional().default(false)
    })).optional()
}).min(1);


module.exports = {
    registerInSchema,
    loginInSchema,
    createListInSchema,
    patchItemInSchema,
    addMemberInSchema,
    updateListInSchema
};