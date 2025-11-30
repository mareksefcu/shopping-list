# Frontend Homework - Shopping List Application

## Overview

This frontend application has been updated to communicate with the backend API instead of Firebase. It includes:

- **API Service Layer**: Switches between mock data and real backend API
- **Authentication**: Login and registration forms
- **CRUD Operations**: All operations use the API service
- **Mock Data Support**: Can run with mock data for development

## Features

### 1. API Service Layer (`src/services/apiService.js`)
- Automatically switches between mock and real API based on configuration
- Handles authentication tokens
- Provides unified interface for all API calls

### 2. Mock Data (`src/services/mockData.js`)
- Pre-configured mock data for development
- Simulates network delays
- Includes sample users and shopping lists

### 3. Configuration (`src/config/api.js`)
- `USE_MOCK_DATA`: Set to `true` to use mock data, `false` for real API
- `API_BASE_URL`: Backend API URL (default: `http://localhost:3000`)
- Environment variables:
  - `REACT_APP_USE_MOCK=true` - Use mock data
  - `REACT_APP_API_URL=http://localhost:3000` - Backend URL

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Mode

**Option A: Use Mock Data (Development)**
Create `.env` file:
```
REACT_APP_USE_MOCK=true
```

**Option B: Use Real Backend API**
Create `.env` file:
```
REACT_APP_USE_MOCK=false
REACT_APP_API_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm start
```

### 4. Start Backend (if using real API)
```bash
cd Shopping-list-backend
npm install
npm start
```

## Usage

### With Mock Data
1. Set `REACT_APP_USE_MOCK=true` in `.env`
2. Start frontend: `npm start`
3. Use any email/password to login (mock data will be used)
4. Pre-configured mock lists will be available

### With Real Backend
1. Set `REACT_APP_USE_MOCK=false` in `.env`
2. Start backend: `cd Shopping-list-backend && npm start`
3. Start frontend: `npm start`
4. Register a new user or login with existing credentials
5. Create and manage shopping lists

## API Endpoints Used

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /list` - Get all shopping lists
- `GET /list/:listId` - Get single shopping list
- `POST /list` - Create shopping list
- `PUT /list/:listId` - Update shopping list
- `DELETE /list/:listId` - Delete shopping list
- `PATCH /list/:listId/items/:itemId` - Update list item

## File Structure

```
src/
├── config/
│   └── api.js              # API configuration
├── services/
│   ├── apiService.js       # API service layer
│   └── mockData.js         # Mock data for development
├── components/
│   ├── LoginForm.jsx       # Login/Register form
│   └── ShoppingListDetailAPI.jsx  # List detail component
└── AppAPI.jsx              # Main app component
```

## Mock Data

The mock data includes:
- 2 sample users (jan@example.com, petra@example.com)
- 2 sample shopping lists
- Password for all users: `password123`

## Building for Production

```bash
npm run build
```

The build folder will contain the production-ready application.

## Notes

- Authentication tokens are stored in localStorage
- Lists refresh automatically every 5 seconds
- Mock data is reset on page refresh
- All API calls include proper error handling


