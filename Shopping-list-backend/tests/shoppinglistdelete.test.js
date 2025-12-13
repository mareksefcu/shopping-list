const request = require('supertest');
const app = require('../server');

// Mock database for testing
jest.mock('../database/mongodb', () => ({
  findListById: jest.fn(),
  deleteList: jest.fn(),
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

describe('DELETE /list/:listId - shoppingList/delete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful JWT verification by default
    jwt.verify.mockReturnValue({ userId: 'test-user-id' });
  });

  // Test šťastného dne: Seznam je úspěšně smazán
  test('should successfully delete the shopping list when user is owner', async () => {
    const existingList = {
      _id: 'test-list-id',
      name: 'Test List',
      ownerId: 'test-user-id', // User is owner
      memberIds: [],
      items: [],
      createdAt: '2023-01-01T00:00:00.000Z',
      isArchived: false
    };

    authorizeListAccess.mockResolvedValue(existingList);
    db.deleteList.mockResolvedValue(existingList);

    const response = await request(app)
      .delete('/list/test-list-id')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(200);

    expect(authorizeListAccess).toHaveBeenCalledWith('test-list-id', 'test-user-id', 'owner');
    expect(db.deleteList).toHaveBeenCalledWith('test-list-id');
    expect(response.body.result).toBe('ok');
  });

  // Alternativní scénář: Seznam k smazání neexistuje
  test('should return 403 error if the list ID to delete is not found', async () => {
    authorizeListAccess.mockRejectedValue(new Error('ListNotFound'));

    const response = await request(app)
      .delete('/list/non-existent-id')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(403);

    expect(authorizeListAccess).toHaveBeenCalledWith('non-existent-id', 'test-user-id', 'owner');
    expect(db.deleteList).not.toHaveBeenCalled();
  });

  // Alternativní scénář: Uživatel není vlastník
  test('should return 403 error if user is not the owner', async () => {
    authorizeListAccess.mockRejectedValue(new Error('Forbidden - OwnerAccessRequired'));

    const response = await request(app)
      .delete('/list/test-list-id')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(403);

    expect(authorizeListAccess).toHaveBeenCalledWith('test-list-id', 'test-user-id', 'owner');
    expect(db.deleteList).not.toHaveBeenCalled();
  });

  // Alternativní scénář: Chybějící token
  test('should return 401 error if authorization token is missing', async () => {
    const response = await request(app)
      .delete('/list/test-list-id')
      .expect(401);

    expect(response.body.code).toBe('auth/missingToken');
  });

  // Alternativní scénář: Neplatný token
  test('should return 401 error if authorization token is invalid', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const response = await request(app)
      .delete('/list/test-list-id')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.code).toBe('auth/invalidToken');
  });
});