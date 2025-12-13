# Backend Evaluation Checklist

## ✅ 1. Full Implementation of the Application (4 points)

### Authentication Endpoints
- ✅ `POST /auth/register` - User registration with email, password, name
  - Password hashing with bcrypt
  - Email uniqueness validation
  - Joi schema validation
  - MongoDB persistence
  
- ✅ `POST /auth/login` - User login with email and password
  - Password verification
  - JWT token generation (1 hour expiry)
  - MongoDB user lookup

### Shopping List Endpoints (uuCmd)

- ✅ `GET /list` - shoppingList/list
  - Returns all lists for authenticated user
  - Filters by ownerId or memberIds
  - Excludes archived lists
  - Returns simplified DTO with listId, name, description, ownerId, itemsCount, createdAt, isArchived

- ✅ `GET /list/:listId` - shoppingList/get
  - Returns single list with full details
  - Includes all items with complete information
  - Authorization check (owner or member)
  - Returns full DTO with all fields

- ✅ `POST /list` - shoppingList/create
  - Creates new shopping list
  - Validates input with Joi schema
  - Generates UUIDs for list and items
  - Sets ownerId from JWT token
  - MongoDB persistence

- ✅ `PUT /list/:listId` - shoppingList/update
  - Updates list properties (name, description, isArchived, items)
  - Owner-only authorization
  - Joi schema validation
  - MongoDB update operation

- ✅ `DELETE /list/:listId` - shoppingList/delete
  - Deletes shopping list permanently
  - Owner-only authorization
  - MongoDB delete operation

### Additional Endpoints

- ✅ `PATCH /list/:listId/items/:itemId` - Update list item
  - Updates individual item properties
  - Member or owner authorization
  - Item validation

- ✅ `DELETE /list/:listId/members/:memberId` - Remove member
  - Removes member from list
  - Owner-only authorization
  - Prevents removing owner

### Technical Implementation

- ✅ MongoDB integration with Mongoose
- ✅ User and ShoppingList models defined
- ✅ JWT authentication middleware
- ✅ Authorization middleware (owner/member checks)
- ✅ Joi validation schemas for all inputs
- ✅ Error handling with appropriate HTTP status codes
- ✅ DTO In/Out patterns
- ✅ RESTful API design

**Status: ✅ KOMPLETNÍ (4/4 body)**

---

## ✅ 2. Export Insomnia Collection (2 points)

### Insomnia Export File
- ✅ File location: `Shopping-list-backend/test/insomnia/Shopping List API.json`
- ✅ Format: Insomnia v4 export format
- ✅ All endpoints included

### Endpoints in Export

**Authentication:**
- ✅ `POST /auth/register` - Register endpoint
- ✅ `POST /auth/login` - Login endpoint

**Shopping Lists:**
- ✅ `GET /list` - List All Shopping Lists (shoppingList/list)
- ✅ `GET /list/:listId` - Get Shopping List (shoppingList/get)
- ✅ `POST /list` - Create Shopping List (shoppingList/create)
- ✅ `PUT /list/:listId` - Update Shopping List (shoppingList/update)
- ✅ `DELETE /list/:listId` - Delete Shopping List (shoppingList/delete)

**Additional:**
- ✅ `PATCH /list/:listId/items/:itemId` - Update List Item
- ✅ `DELETE /list/:listId/members/:memberId` - Remove Member

### Export Features

- ✅ Environment variables configured:
  - `base_url`: http://localhost:3000
  - `token`: For JWT authentication
  - `listId`: For list operations
  - `itemId`: For item operations
  - `memberId`: For member operations

- ✅ Request examples with sample data
- ✅ Headers configured (Content-Type, Authorization)
- ✅ Request bodies with JSON examples
- ✅ Proper HTTP methods
- ✅ URL parameters defined

**Status: ✅ KOMPLETNÍ (2/2 body)**

---

## ✅ 3. Scenario Description of Given Endpoints (4 points)

### Scenario Descriptions Created

- ✅ `shoppingList/list` (GET /list) - Complete algorithm flow
  - Step-by-step algorithm description
  - Input/Output DTO specifications
  - Error cases documented
  - Authorization flow

- ✅ `shoppingList/get` (GET /list/:listId) - Complete algorithm flow
  - Step-by-step algorithm description
  - Input/Output DTO specifications
  - Error cases documented
  - Authorization flow (owner/member check)

- ✅ `shoppingList/create` (POST /list) - Complete algorithm flow
  - Step-by-step algorithm description
  - Input/Output DTO specifications
  - Validation steps
  - UUID generation process

- ✅ `shoppingList/update` (PUT /list/:listId) - Complete algorithm flow
  - Step-by-step algorithm description
  - Input/Output DTO specifications
  - Owner authorization check
  - Update process

- ✅ `shoppingList/delete` (DELETE /list/:listId) - Complete algorithm flow
  - Step-by-step algorithm description
  - Input/Output DTO specifications
  - Owner authorization check
  - Deletion process

### Scenario Format

Each scenario includes:
- ✅ Algorithm flow in structured format (START/END, IF/THEN/ELSE)
- ✅ Input DTO specification (headers, parameters, body)
- ✅ Output DTO specification (status, body structure)
- ✅ Error cases with HTTP status codes
- ✅ Authorization checks
- ✅ Database operations
- ✅ Validation steps

**File Location:** `Shopping-list-backend/SCENARIOS.md`

**Status: ✅ KOMPLETNÍ (4/4 body)**

---

## 📊 Celkové hodnocení

| Kritérium | Body | Status |
|-----------|------|--------|
| Full Implementation | 4 | ✅ |
| Insomnia Export | 2 | ✅ |
| Scenario Descriptions | 4 | ✅ |
| **CELKEM** | **10** | ✅ |

**Status: ✅ VŠECHNA KRITÉRIA SPLNĚNA (10/10 bodů)**

---

## 📁 Struktura souborů

```
Shopping-list-backend/
├── config/
│   └── database.js              # MongoDB connection
├── controllers/
│   ├── authController.js        # Authentication endpoints
│   └── listController.js        # Shopping list endpoints
├── database/
│   └── mongodb.js               # MongoDB operations
├── middleware/
│   └── authMiddleware.js        # JWT auth & authorization
├── models/
│   ├── schemas.js               # Joi validation schemas
│   ├── User.js                  # User Mongoose model
│   └── ShoppingList.js          # ShoppingList Mongoose model
├── test/
│   └── insomnia/
│       └── Shopping List API.json  # Insomnia export
├── server.js                    # Express server setup
├── package.json                 # Dependencies
├── README.md                    # Documentation
├── SCENARIOS.md                 # Scenario descriptions
└── EVALUATION_CHECKLIST.md      # This file
```

---

## 🎯 Implementované funkce

### Authentication
- ✅ User registration with validation
- ✅ User login with JWT token
- ✅ Password hashing (bcrypt)
- ✅ Token-based authentication

### Shopping Lists
- ✅ Create shopping list
- ✅ Get all lists (filtered by user)
- ✅ Get single list (with authorization)
- ✅ Update list (owner only)
- ✅ Delete list (owner only)
- ✅ Update list items
- ✅ Manage list members

### Security
- ✅ JWT token authentication
- ✅ Role-based authorization (owner/member)
- ✅ Input validation (Joi schemas)
- ✅ Password hashing

### Database
- ✅ MongoDB integration
- ✅ Mongoose models
- ✅ Persistent storage
- ✅ Error handling

---

## ✅ Poznámky

- Všechny požadavky jsou splněny
- Insomnia export obsahuje všechny endpointy
- Scénáře jsou popsány v algoritmickém formátu
- Aplikace je plně funkční s MongoDB
- Všechny endpointy jsou testovatelné přes Insomnia
- Aplikace je připravena k odevzdání





