const request = require('supertest');
const app = require('../server');

// Mock database for testing
jest.mock('../database/mongodb', () => ({
  findListById: jest.fn(),
  updateListDocument: jest.fn(),
}));

// Mock JWT for testing
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

// Mock auth middleware
jest.mock('../middleware/authMiddleware', () => ({
  authenticateUser: jest.fn(),
  authorizeListAccess: jest.fn(),
}));

// Set up the authenticateUser mock
const { authenticateUser } = require('../middleware/authMiddleware');
authenticateUser.mockImplementation((req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ code: "auth/missingToken", message: "Authentication token is missing." });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, 'mock-secret');
    req.userId = decoded.userId;
    next();
  } catch (e) {
    return res.status(401).json({ code: "auth/invalidToken", message: "Invalid or expired token." });
  }
});

// Mock JWT for testing
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const db = require('../database/mongodb');
const jwt = require('jsonwebtoken');
const { authorizeListAccess } = require('../middleware/authMiddleware');

describe('PUT /list/:listId - shoppingList/update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful JWT verification by default
    jwt.verify.mockReturnValue({ userId: 'test-user-id' });
  });

  // Test šťastného dne: Úspěšná aktualizace názvu
  test('should successfully update the list name when user is owner', async () => {
    const existingList = {
      _id: 'test-list-id',
      name: 'Starý název',
      description: 'Popis',
      ownerId: 'test-user-id', // User is owner
      memberIds: [],
      items: [],
      createdAt: '2023-01-01T00:00:00.000Z',
      isArchived: false
    };

    const updateData = {
      name: 'Nový název',
      description: 'Aktualizovaný popis'
    };

    const updatedList = { ...existingList, ...updateData };

    authorizeListAccess.mockResolvedValue(existingList);
    db.updateListDocument.mockResolvedValue(updatedList);

    const response = await request(app)
      .put('/list/test-list-id')
      .set('Authorization', 'Bearer mock-jwt-token')
      .send(updateData)
      .expect(200);

    expect(authorizeListAccess).toHaveBeenCalledWith('test-list-id', 'test-user-id', 'owner');
    expect(db.updateListDocument).toHaveBeenCalledWith('test-list-id', updateData);
    expect(response.body.result).toBe('ok');
  });

  // Alternativní scénář: Nenalezený seznam
  test('should return 403 error if the list to update is not found', async () => {
    const updateData = { name: 'Nový název' };
    authorizeListAccess.mockRejectedValue(new Error('ListNotFound'));

    const response = await request(app)
      .put('/list/non-existent-id')
      .set('Authorization', 'Bearer mock-jwt-token')
      .send(updateData)
      .expect(403);

    expect(authorizeListAccess).toHaveBeenCalledWith('non-existent-id', 'test-user-id', 'owner');
    expect(db.updateListDocument).not.toHaveBeenCalled();
  });

  // Alternativní scénář: Uživatel není vlastník
  test('should return 403 error if user is not the owner', async () => {
    const updateData = { name: 'Nový název' };
    authorizeListAccess.mockRejectedValue(new Error('Forbidden - OwnerAccessRequired'));

    const response = await request(app)
      .put('/list/test-list-id')
      .set('Authorization', 'Bearer mock-jwt-token')
      .send(updateData)
      .expect(403);

    expect(authorizeListAccess).toHaveBeenCalledWith('test-list-id', 'test-user-id', 'owner');
    expect(db.updateListDocument).not.toHaveBeenCalled();
  });

  // Alternativní scénář: Neplatná vstupní data (prázdný název)
  test('should return 400 error if the name is empty', async () => {
    const existingList = {
      _id: 'test-list-id',
      name: 'Test List',
      ownerId: 'test-user-id',
      memberIds: [],
      items: [],
      createdAt: '2023-01-01T00:00:00.000Z',
      isArchived: false
    };

    const updateData = { name: '' };
    db.findListById.mockResolvedValue(existingList);

    const response = await request(app)
      .put('/list/test-list-id')
      .set('Authorization', 'Bearer mock-jwt-token')
      .send(updateData)
      .expect(400);

    expect(response.body.code).toBe('list/invalidDtoIn');
    expect(db.updateListDocument).not.toHaveBeenCalled();
  });

  // Alternativní scénář: Chybějící token
  test('should return 401 error if authorization token is missing', async () => {
    const updateData = { name: 'Nový název' };

    const response = await request(app)
      .put('/list/test-list-id')
      .send(updateData)
      .expect(401);

    expect(response.body.code).toBe('auth/missingToken');
  });

  // Alternativní scénář: Neplatný token
  test('should return 401 error if authorization token is invalid', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const updateData = { name: 'Nový název' };

    const response = await request(app)
      .put('/list/test-list-id')
      .set('Authorization', 'Bearer invalid-token')
      .send(updateData)
      .expect(401);

    expect(response.body.code).toBe('auth/invalidToken');
  });
});