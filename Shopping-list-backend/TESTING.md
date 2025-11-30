# Testing with Insomnia

## Quick Start Guide

### Step 1: Install Dependencies
```bash
cd Shopping-list-backend
npm install
```

### Step 2: Start MongoDB
Make sure MongoDB is running:
- **Local MongoDB**: Start MongoDB service on `mongodb://localhost:27017`
- **MongoDB Atlas**: Set environment variable `MONGODB_URI` with your connection string

### Step 3: Start the Server
```bash
npm start
```
You should see: `Server bezi na http://localhost:3000`

### Step 4: Import into Insomnia

1. Open Insomnia
2. Click **Create** → **Import** (or use `Ctrl+O` / `Cmd+O`)
3. Select **From File**
4. Navigate to: `Shopping-list-backend/test/insomnia/Shopping List API.json`
5. Click **Import**

### Step 5: Testing Workflow

#### 1. Register a User
- Open **Authentication** → **Register**
- Click **Send**
- Copy the `userId` from the response (you'll need it later)

#### 2. Login
- Open **Authentication** → **Login**
- Use the same email/password from registration
- Copy the `token` from the response
- Go to **Manage Environments** (top right)
- Select **Base Environment**
- Paste the token into the `token` variable

#### 3. Create a Shopping List
- Open **Shopping Lists** → **Create Shopping List**
- Modify the JSON body if needed
- Click **Send**
- Copy the `listId` from the response
- Add it to the environment variable `listId`

#### 4. Test Other Endpoints
- **List All Shopping Lists**: Get all lists for your user
- **Get Shopping List**: Get details of a specific list (uses `listId` from environment)
- **Update Shopping List**: Modify list properties
- **Delete Shopping List**: Remove a list
- **Update List Item**: Modify an item in a list
- **Remove Member**: Remove a member from a list

## Environment Variables

The Insomnia export includes these environment variables:
- `base_url`: `http://localhost:3000` (default)
- `token`: JWT token from login (set after login)
- `listId`: ID of a shopping list (set after creating a list)
- `itemId`: ID of an item in a list
- `memberId`: ID of a member user

## Troubleshooting

### Server not starting
- Check if MongoDB is running
- Verify port 3000 is not in use
- Check MongoDB connection string

### Authentication errors
- Make sure you've logged in and set the `token` environment variable
- Token expires after 1 hour - login again to get a new token

### MongoDB connection errors
- Verify MongoDB is running
- Check connection string in `config/database.js` or set `MONGODB_URI` environment variable


