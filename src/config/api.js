// config/api.js
// Configuration for API usage - switch between mock and real API

// Set to true to use mock data, false to use real backend API
// Default to true for submission (mock data enabled by default)
export const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK !== 'false';

// Backend API base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Get stored token from localStorage
export const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Store token in localStorage
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        localStorage.removeItem('authToken');
    }
};

// Get stored user ID from localStorage
export const getUserId = () => {
    return localStorage.getItem('userId');
};

// Store user ID in localStorage
export const setUserId = (userId) => {
    if (userId) {
        localStorage.setItem('userId', userId);
    } else {
        localStorage.removeItem('userId');
    }
};

// Clear all auth data
export const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
};

