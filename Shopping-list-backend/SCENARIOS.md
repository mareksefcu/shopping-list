# Scenario Descriptions - Shopping List API Endpoints

## Overview
This document describes the scenarios for the main shopping list endpoints (uuCmd) using algorithm component format.

---

## 1. shoppingList/list (GET /list)

### Purpose
Retrieve all shopping lists that belong to the authenticated user (either as owner or member).

### Algorithm Flow

```
1. START
2. Extract JWT token from Authorization header
3. IF token is missing THEN
      RETURN 401 Unauthorized (auth/missingToken)
   END IF
4. Verify JWT token
5. IF token is invalid or expired THEN
      RETURN 401 Unauthorized (auth/invalidToken)
   END IF
6. Extract userId from decoded token
7. Query MongoDB for lists where:
      - ownerId equals userId OR
      - userId is in memberIds array AND
      - isArchived is false
8. Sort lists by createdAt (descending - newest first)
9. Map each list to DTO Out format:
      - listId (from _id)
      - name
      - description
      - ownerId
      - itemsCount (length of items array)
      - createdAt
      - isArchived
10. RETURN 200 OK with JSON:
      {
        result: "ok",
        lists: [array of list objects]
      }
11. IF database error occurs THEN
      RETURN 500 Internal Server Error (list/serverError)
   END IF
12. END
```

### Input (DTO In)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: None
- **Query Parameters**: None

### Output (DTO Out)
- **Status**: 200 OK
- **Body**:
```json
{
  "result": "ok",
  "lists": [
    {
      "listId": "uuid",
      "name": "string",
      "description": "string",
      "ownerId": "uuid",
      "itemsCount": 0,
      "createdAt": "ISO date string",
      "isArchived": false
    }
  ]
}
```

### Error Cases
- 401: Missing or invalid token
- 500: Database/server error

---

## 2. shoppingList/get (GET /list/:listId)

### Purpose
Retrieve detailed information about a specific shopping list, including all items.

### Algorithm Flow

```
1. START
2. Extract JWT token from Authorization header
3. Extract listId from URL parameters
4. IF token is missing THEN
      RETURN 401 Unauthorized (auth/missingToken)
   END IF
5. Verify JWT token
6. IF token is invalid THEN
      RETURN 401 Unauthorized (auth/invalidToken)
   END IF
7. Extract userId from decoded token
8. Query MongoDB for list with _id = listId
9. IF list not found THEN
      RETURN 403 Forbidden (ListNotFound)
   END IF
10. Check authorization:
      - IF userId equals list.ownerId THEN
            authorization = "owner"
        ELSE IF userId is in list.memberIds THEN
            authorization = "member"
        ELSE
            RETURN 403 Forbidden (Forbidden - MemberAccessRequired)
        END IF
11. Map list to DTO Out format:
      - listId (from _id)
      - name
      - description
      - ownerId
      - memberIds (array)
      - items (full array with all item details)
      - createdAt
      - isArchived
12. RETURN 200 OK with JSON:
      {
        result: "ok",
        list: {list object}
      }
13. IF database error occurs THEN
      RETURN 500 Internal Server Error (list/serverError)
   END IF
14. END
```

### Input (DTO In)
- **Headers**: `Authorization: Bearer <token>`
- **URL Parameters**: `listId` (UUID string)
- **Body**: None

### Output (DTO Out)
- **Status**: 200 OK
- **Body**:
```json
{
  "result": "ok",
  "list": {
    "listId": "uuid",
    "name": "string",
    "description": "string",
    "ownerId": "uuid",
    "memberIds": ["uuid"],
    "items": [
      {
        "itemId": "uuid",
        "name": "string",
        "quantity": 1,
        "unit": "string",
        "done": false
      }
    ],
    "createdAt": "ISO date string",
    "isArchived": false
  }
}
```

### Error Cases
- 401: Missing or invalid token
- 403: List not found or access denied
- 500: Database/server error

---

## 3. shoppingList/create (POST /list)

### Purpose
Create a new shopping list for the authenticated user.

### Algorithm Flow

```
1. START
2. Extract JWT token from Authorization header
3. Extract request body
4. IF token is missing THEN
      RETURN 401 Unauthorized (auth/missingToken)
   END IF
5. Verify JWT token
6. IF token is invalid THEN
      RETURN 401 Unauthorized (auth/invalidToken)
   END IF
7. Validate request body against createListInSchema:
      - name: string, min 3, max 100 characters, required
      - description: string, max 500 characters, optional
      - items: array of items, optional, default []
8. IF validation fails THEN
      RETURN 400 Bad Request (list/invalidDtoIn)
   END IF
9. Extract userId from decoded token
10. Generate new listId using UUID v4
11. Get current timestamp as ISO string
12. Process items array:
      FOR EACH item in items:
          - Generate itemId using UUID v4
          - Set done = false
          - Keep name, quantity, unit from input
      END FOR
13. Create new list document:
      {
        _id: listId,
        name: listData.name,
        description: listData.description || null,
        ownerId: userId,
        memberIds: [],
        items: processedItems,
        createdAt: timestamp,
        isArchived: false
      }
14. Save list to MongoDB
15. RETURN 200 OK with JSON:
      {
        listId: listId,
        name: name,
        ownerId: userId,
        itemsCount: items.length
      }
16. IF database error occurs THEN
      RETURN 500 Internal Server Error (list/serverError)
   END IF
17. END
```

### Input (DTO In)
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body**:
```json
{
  "name": "string (3-100 chars)",
  "description": "string (max 500 chars, optional)",
  "items": [
    {
      "name": "string (1-255 chars)",
      "quantity": 1,
      "unit": "string (optional, default 'ks')"
    }
  ]
}
```

### Output (DTO Out)
- **Status**: 200 OK
- **Body**:
```json
{
  "listId": "uuid",
  "name": "string",
  "ownerId": "uuid",
  "itemsCount": 0
}
```

### Error Cases
- 400: Validation error
- 401: Missing or invalid token
- 500: Database/server error

---

## 4. shoppingList/update (PUT /list/:listId)

### Purpose
Update properties of an existing shopping list (name, description, isArchived, items).

### Algorithm Flow

```
1. START
2. Extract JWT token from Authorization header
3. Extract listId from URL parameters
4. Extract request body
5. IF token is missing THEN
      RETURN 401 Unauthorized (auth/missingToken)
   END IF
6. Verify JWT token
7. IF token is invalid THEN
      RETURN 401 Unauthorized (auth/invalidToken)
   END IF
8. Validate request body against updateListInSchema:
      - name: string, min 3, max 100 characters, optional
      - description: string, max 500 characters, optional, can be null
      - isArchived: boolean, optional
      - items: array of items with itemId, optional
9. IF validation fails THEN
      RETURN 400 Bad Request (list/invalidDtoIn)
   END IF
10. Extract userId from decoded token
11. Query MongoDB for list with _id = listId
12. IF list not found THEN
      RETURN 403 Forbidden (ListNotFound)
   END IF
13. Check authorization:
      - IF userId equals list.ownerId THEN
            authorization = "owner"
        ELSE
            RETURN 403 Forbidden (Forbidden - OwnerAccessRequired)
        END IF
14. Update list document in MongoDB with provided fields
15. Retrieve updated list from database
16. Map updated list to DTO Out format:
      - listId
      - name
      - description
      - ownerId
      - itemsCount
      - isArchived
17. RETURN 200 OK with JSON:
      {
        result: "ok",
        list: {updated list object}
      }
18. IF database error occurs THEN
      RETURN 500 Internal Server Error (list/serverError)
   END IF
19. END
```

### Input (DTO In)
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **URL Parameters**: `listId` (UUID string)
- **Body** (at least one field required):
```json
{
  "name": "string (3-100 chars, optional)",
  "description": "string (max 500 chars, optional, can be null)",
  "isArchived": false,
  "items": [
    {
      "itemId": "uuid",
      "name": "string",
      "quantity": 1,
      "unit": "string",
      "done": false
    }
  ]
}
```

### Output (DTO Out)
- **Status**: 200 OK
- **Body**:
```json
{
  "result": "ok",
  "list": {
    "listId": "uuid",
    "name": "string",
    "description": "string",
    "ownerId": "uuid",
    "itemsCount": 0,
    "isArchived": false
  }
}
```

### Error Cases
- 400: Validation error
- 401: Missing or invalid token
- 403: List not found or access denied (only owner can update)
- 500: Database/server error

---

## 5. shoppingList/delete (DELETE /list/:listId)

### Purpose
Delete a shopping list permanently from the database.

### Algorithm Flow

```
1. START
2. Extract JWT token from Authorization header
3. Extract listId from URL parameters
4. IF token is missing THEN
      RETURN 401 Unauthorized (auth/missingToken)
   END IF
5. Verify JWT token
6. IF token is invalid THEN
      RETURN 401 Unauthorized (auth/invalidToken)
   END IF
7. Extract userId from decoded token
8. Query MongoDB for list with _id = listId
9. IF list not found THEN
      RETURN 403 Forbidden (ListNotFound)
   END IF
10. Check authorization:
      - IF userId equals list.ownerId THEN
            authorization = "owner"
        ELSE
            RETURN 403 Forbidden (Forbidden - OwnerAccessRequired)
        END IF
11. Delete list document from MongoDB
12. IF deletion successful THEN
      RETURN 200 OK with JSON:
          {
            result: "ok",
            message: "List {listId} deleted successfully."
          }
   ELSE
      RETURN 404 Not Found (list/listNotFound)
   END IF
13. IF database error occurs THEN
      RETURN 500 Internal Server Error (list/serverError)
   END IF
14. END
```

### Input (DTO In)
- **Headers**: `Authorization: Bearer <token>`
- **URL Parameters**: `listId` (UUID string)
- **Body**: None

### Output (DTO Out)
- **Status**: 200 OK
- **Body**:
```json
{
  "result": "ok",
  "message": "List {listId} deleted successfully."
}
```

### Error Cases
- 401: Missing or invalid token
- 403: List not found or access denied (only owner can delete)
- 404: List not found after deletion attempt
- 500: Database/server error

---

## Summary

All five required endpoints (shoppingList/list, shoppingList/get, shoppingList/create, shoppingList/update, shoppingList/delete) are fully implemented with:

- ✅ Complete algorithm flow descriptions
- ✅ Input/Output DTO specifications
- ✅ Error handling scenarios
- ✅ Authorization checks
- ✅ MongoDB integration
- ✅ Validation using Joi schemas





