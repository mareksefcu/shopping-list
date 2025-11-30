// utils/errorHandler.js
// Non-visual utility component for error handling

/**
 * Formats error messages for display
 * @param {Error|string} error - The error object or message
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
    if (typeof error === 'string') {
        return error;
    }
    
    if (error?.message) {
        return error.message;
    }
    
    return 'Došlo k neočekávané chybě.';
};

/**
 * Handles API errors and extracts user-friendly messages
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if error parsing fails
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error, defaultMessage = 'Operace selhala') => {
    console.error('API Error:', error);
    
    // Check for network errors
    if (error.message?.includes('Network') || error.message?.includes('Failed to fetch')) {
        return 'Chyba připojení k serveru. Zkontrolujte připojení k internetu.';
    }
    
    // Check for authentication errors
    if (error.message?.includes('401') || error.message?.includes('token') || error.message?.includes('auth')) {
        return 'Chyba autentizace. Prosím přihlaste se znovu.';
    }
    
    // Check for validation errors
    if (error.message?.includes('Validation') || error.message?.includes('invalid')) {
        return 'Neplatná data. Zkontrolujte zadané údaje.';
    }
    
    // Return formatted message or default
    return formatErrorMessage(error) || defaultMessage;
};


