const request = require('supertest');
const app = require('../server');

// Mock database for testing
jest.mock('../database/mongodb', () => ({
  saveList: jest.fn(),
}));

// Mock JWT for testing
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

// Mock UUID for testing
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

const db = require('../database/mongodb');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

describe('POST /list - shoppingList/create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful JWT verification
    jwt.verify.mockReturnValue({ userId: 'test-user-id' });
    // Mock UUID generation
    uuidv4.mockReturnValue('new-list-id-123');
  });

  // Test šťastného dne
  test('should successfully create a new shopping list', async () => {
    const newListData = {
      name: 'Párty',
      description: 'Nákup na páteční párty',
      items: [
        { name: 'Pivo', quantity: 10 },
        { name: 'Čipy', quantity: 2 }
      ]
    };

    const savedList = {
      _id: 'new-list-id-123',
      name: 'Párty',
      description: 'Nákup na páteční párty',
      ownerId: 'test-user-id',
      memberIds: [],
      items: [
        { itemId: 'item1', name: 'Pivo', quantity: 10, done: false },
        { itemId: 'item2', name: 'Čipy', quantity: 2, done: false }
      ],
      createdAt: '2023-01-01T00:00:00.000Z',
      isArchived: false
    };

    db.saveList.mockResolvedValue(savedList);

    const response = await request(app)
      .post('/list')
      .set('Authorization', 'Bearer mock-jwt-token')
      .send(newListData)
      .expect(200);

    expect(db.saveList).toHaveBeenCalledTimes(1);
    const savedArg = db.saveList.mock.calls[0][0];
    expect(savedArg.name).toBe('Párty');
    expect(savedArg.description).toBe('Nákup na páteční párty');
    expect(savedArg.ownerId).toBe('test-user-id');
    expect(savedArg.items).toHaveLength(2);

    expect(response.body.listId).toBe('new-list-id-123');
    expect(response.body.name).toBe('Párty');
    expect(response.body.ownerId).toBe('test-user-id');
    expect(response.body.itemsCount).toBe(2);
  });

  // Alternativní scénář: Chybí název (Invalid input)
  test('should return 400 error if the name is missing', async () => {
    const invalidData = {
      description: 'Nákup bez názvu',
      items: []
    };

    const response = await request(app)
      .post('/list')
      .set('Authorization', 'Bearer mock-jwt-token')
      .send(invalidData)
      .expect(400);

    expect(response.body.code).toBe('list/invalidDtoIn');
    expect(response.body.message).toBe('Validation error.');
    expect(db.saveList).not.toHaveBeenCalled();
  });

  // Alternativní scénář: Prázdný název
  test('should return 400 error if the name is empty', async () => {
    const invalidData = {
      name: '',
      description: 'Nákup s prázdným názvem',
      items: []
    };

    const response = await request(app)
      .post('/list')
      .set('Authorization', 'Bearer mock-jwt-token')
      .send(invalidData)
      .expect(400);

    expect(response.body.code).toBe('list/invalidDtoIn');
    expect(response.body.message).toBe('Validation error.');
    expect(db.saveList).not.toHaveBeenCalled();
  });

  // Alternativní scénář: Chybějící token
  test('should return 401 error if authorization token is missing', async () => {
    const validData = {
      name: 'Test List',
      items: []
    };

    const response = await request(app)
      .post('/list')
      .send(validData)
      .expect(401);

    expect(response.body.code).toBe('auth/missingToken');
  });

  // Alternativní scénář: Neplatný token
  test('should return 401 error if authorization token is invalid', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const validData = {
      name: 'Test List',
      items: []
    };

    const response = await request(app)
      .post('/list')
      .set('Authorization', 'Bearer invalid-token')
      .send(validData)
      .expect(401);

    expect(response.body.code).toBe('auth/invalidToken');
  });
});