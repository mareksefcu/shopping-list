// services/apiService.js
// API service that switches between mock and real API

import { USE_MOCK_DATA, API_BASE_URL, getAuthToken } from '../config/api';
import { mockAuthService, mockListService } from './mockData';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
};

// Authentication Service
export const authService = {
    async register(email, password, name) {
        if (USE_MOCK_DATA) {
            return mockAuthService.register(email, password, name);
        }
        return apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });
    },

    async login(email, password) {
        if (USE_MOCK_DATA) {
            return mockAuthService.login(email, password);
        }
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }
};

// Shopping List Service
export const listService = {
    async getLists() {
        if (USE_MOCK_DATA) {
            const userId = localStorage.getItem('userId');
            return mockListService.getLists(userId);
        }
        const response = await apiCall('/list', {
            method: 'GET'
        });
        return response.lists || [];
    },

    async getList(listId) {
        if (USE_MOCK_DATA) {
            return mockListService.getList(listId);
        }
        const response = await apiCall(`/list/${listId}`, {
            method: 'GET'
        });
        return response.list;
    },

    async createList(listData) {
        if (USE_MOCK_DATA) {
            const userId = localStorage.getItem('userId');
            return mockListService.createList({ ...listData, ownerId: userId });
        }
        return apiCall('/list', {
            method: 'POST',
            body: JSON.stringify(listData)
        });
    },

    async updateList(listId, updateData) {
        if (USE_MOCK_DATA) {
            return mockListService.updateList(listId, updateData);
        }
        return apiCall(`/list/${listId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    },

    async deleteList(listId) {
        if (USE_MOCK_DATA) {
            return mockListService.deleteList(listId);
        }
        return apiCall(`/list/${listId}`, {
            method: 'DELETE'
        });
    },

    async updateListItem(listId, itemId, updateData) {
        if (USE_MOCK_DATA) {
            return mockListService.updateListItem(listId, itemId, updateData);
        }
        return apiCall(`/list/${listId}/items/${itemId}`, {
            method: 'PATCH',
            body: JSON.stringify(updateData)
        });
    }
};


