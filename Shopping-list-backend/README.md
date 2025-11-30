# Shopping List Backend

Backend API for Shopping List application with MongoDB persistence.

## Features

- User authentication (register/login) with JWT tokens
- CRUD operations for shopping lists
- MongoDB persistent storage
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas connection string)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up MongoDB:
   - For local MongoDB: Ensure MongoDB is running on `mongodb://localhost:27017`
   - For MongoDB Atlas: Set the `MONGODB_URI` environment variable

## Configuration

The application uses MongoDB for persistent storage. You can configure the connection string via:

- Environment variable: `MONGODB_URI`
- Default: `mongodb://localhost:27017/shopping-list`

## Running the Application

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

### Shopping Lists (uuCmd)

- `GET /list` - Get all shopping lists for authenticated user (shoppingList/list)
- `GET /list/:listId` - Get a single shopping list (shoppingList/get)
- `POST /list` - Create a new shopping list (shoppingList/create)
- `PUT /list/:listId` - Update a shopping list (shoppingList/update)
- `DELETE /list/:listId` - Delete a shopping list (shoppingList/delete)

### Additional Endpoints

- `PATCH /list/:listId/items/:itemId` - Update an item in a list
- `DELETE /list/:listId/members/:memberId` - Remove a member from a list

## Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Insomnia Export

The Insomnia environment export is available in `test/insomnia/Shopping List API.json`. Import this file into Insomnia to test all endpoints.

## Database Models

### User
- `_id` (String, UUID)
- `email` (String, unique)
- `password` (String, hashed)
- `name` (String)
- `state` (String, default: "active")

### ShoppingList
- `_id` (String, UUID)
- `name` (String)
- `description` (String, optional)
- `ownerId` (String)
- `memberIds` (Array of Strings)
- `items` (Array of ListItem objects)
- `createdAt` (String, ISO date)
- `isArchived` (Boolean)

### ListItem
- `itemId` (String, UUID)
- `name` (String)
- `quantity` (Number)
- `unit` (String)
- `done` (Boolean)


