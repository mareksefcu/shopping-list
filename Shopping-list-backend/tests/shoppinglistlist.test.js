const request = require('supertest');
const app = require('../server');

// Mock database for testing
jest.mock('../database/mongodb', () => ({
  findListsByUserId: jest.fn(),
}));

// Mock JWT for testing
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const db = require('../database/mongodb');
const jwt = require('jsonwebtoken');

describe('GET /list - shoppingList/list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful JWT verification
    jwt.verify.mockReturnValue({ userId: 'test-user-id' });
  });

  // Test šťastného dne: Seznam je úspěšně vrácen
  test('should return an array of shopping lists for authenticated user', async () => {
    const mockLists = [
      {
        _id: 'list1',
        name: 'Potraviny',
        description: 'Týdenní nákup',
        ownerId: 'test-user-id',
        items: [{ itemId: 'item1', name: 'Mléko', done: false }],
        createdAt: '2023-01-01T00:00:00.000Z',
        isArchived: false
      },
      {
        _id: 'list2',
        name: 'Domácnost',
        description: 'Čisticí prostředky',
        ownerId: 'test-user-id',
        items: [],
        createdAt: '2023-01-02T00:00:00.000Z',
        isArchived: false
      },
    ];

    db.findListsByUserId.mockResolvedValue(mockLists);

    const response = await request(app)
      .get('/list')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(200);

    expect(db.findListsByUserId).toHaveBeenCalledWith('test-user-id');
    expect(response.body.result).toBe('ok');
    expect(response.body.lists).toHaveLength(2);
    expect(response.body.lists[0]).toMatchObject({
      listId: 'list1',
      name: 'Potraviny',
      description: 'Týdenní nákup',
      ownerId: 'test-user-id',
      itemsCount: 1,
      isArchived: false
    });
    expect(response.body.lists[1]).toMatchObject({
      listId: 'list2',
      name: 'Domácnost',
      description: 'Čisticí prostředky',
      ownerId: 'test-user-id',
      itemsCount: 0,
      isArchived: false
    });
  });

  // Alternativní scénář: Chyba v databázi
  test('should return 500 error if database query fails', async () => {
    const dbError = new Error('Database connection failed');
    db.findListsByUserId.mockRejectedValue(dbError);

    const response = await request(app)
      .get('/list')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(500);

    expect(response.body.code).toBe('list/serverError');
    expect(response.body.message).toBe('Internal server error.');
  });

  // Alternativní scénář: Chybějící token
  test('should return 401 error if authorization token is missing', async () => {
    const response = await request(app)
      .get('/list')
      .expect(401);

    expect(response.body.code).toBe('auth/missingToken');
  });

  // Alternativní scénář: Neplatný token
  test('should return 401 error if authorization token is invalid', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const response = await request(app)
      .get('/list')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.code).toBe('auth/invalidToken');
  });
});