const request = require('supertest');
const app = require('../server');

// Mock database for testing
jest.mock('../database/mongodb', () => ({
  findListById: jest.fn(),
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

describe('GET /list/:listId - shoppingList/get', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful JWT verification by default
    jwt.verify.mockReturnValue({ userId: 'test-user-id' });
  });

  // Test šťastného dne: Seznam s ID je úspěšně nalezen
  test('should return the shopping list object for a valid ID when user is owner', async () => {
    const mockList = {
      _id: 'test-list-id',
      name: 'Týdenní nákup',
      description: 'Nákup na celý týden',
      ownerId: 'test-user-id', // User is owner
      memberIds: ['other-user-id'],
      items: [
        { itemId: 'item1', name: 'Mléko', quantity: 2, done: false },
        { itemId: 'item2', name: 'Chléb', quantity: 1, done: true }
      ],
      createdAt: '2023-01-01T00:00:00.000Z',
      isArchived: false
    };

    authorizeListAccess.mockResolvedValue(mockList);

    const response = await request(app)
      .get('/list/test-list-id')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(200);

    expect(authorizeListAccess).toHaveBeenCalledWith('test-list-id', 'test-user-id', 'member');
    expect(response.body.result).toBe('ok');
    expect(response.body.list.listId).toBe('test-list-id');
    expect(response.body.list.name).toBe('Týdenní nákup');
    expect(response.body.list.description).toBe('Nákup na celý týden');
    expect(response.body.list.ownerId).toBe('test-user-id');
    expect(response.body.list.items).toHaveLength(2);
  });

  // Test šťastného dne: Seznam s ID je úspěšně nalezen (uživatel je členem)
  test('should return the shopping list object for a valid ID when user is member', async () => {
    const mockList = {
      _id: 'test-list-id',
      name: 'Týdenní nákup',
      description: 'Nákup na celý týden',
      ownerId: 'other-user-id', // Different owner
      memberIds: ['test-user-id'], // User is member
      items: [
        { itemId: 'item1', name: 'Mléko', quantity: 2, done: false }
      ],
      createdAt: '2023-01-01T00:00:00.000Z',
      isArchived: false
    };

    db.findListById.mockResolvedValue(mockList);

    const response = await request(app)
      .get('/list/test-list-id')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(200);

    expect(response.body.result).toBe('ok');
    expect(response.body.list.listId).toBe('test-list-id');
  });

  // Alternativní scénář: Seznam s daným ID neexistuje
  test('should return 403 error if the list ID is not found', async () => {
    authorizeListAccess.mockRejectedValue(new Error('ListNotFound'));

    const response = await request(app)
      .get('/list/non-existent-id')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(403);

    expect(authorizeListAccess).toHaveBeenCalledWith('non-existent-id', 'test-user-id', 'member');
  });

  // Alternativní scénář: Uživatel nemá přístup k seznamu
  test('should return 403 error if user does not have access to the list', async () => {
    const mockList = {
      _id: 'test-list-id',
      name: 'Private List',
      ownerId: 'other-user-id', // Different owner
      memberIds: ['another-user-id'], // User is not a member
      items: [],
      createdAt: '2023-01-01T00:00:00.000Z',
      isArchived: false
    };

    db.findListById.mockResolvedValue(mockList);

    const response = await request(app)
      .get('/list/test-list-id')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(403);

    expect(response.body.message).toContain('Access denied');
  });

  // Alternativní scénář: Chybějící token
  test('should return 401 error if authorization token is missing', async () => {
    const response = await request(app)
      .get('/list/test-list-id')
      .expect(401);

    expect(response.body.code).toBe('auth/missingToken');
  });

  // Alternativní scénář: Neplatný token
  test('should return 401 error if authorization token is invalid', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const response = await request(app)
      .get('/list/test-list-id')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.code).toBe('auth/invalidToken');
  });
});