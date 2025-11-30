// hooks/useApiState.js
// Custom hook for managing API call states (pending, error, ready)
// Non-visual component for state management

import { useState, useCallback } from 'react';

/**
 * Custom hook for managing API call states
 * @returns {Object} State and handlers for API operations
 */
export const useApiState = () => {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);
    const [isReady, setIsReady] = useState(false);

    const startRequest = useCallback(() => {
        setIsPending(true);
        setError(null);
        setIsReady(false);
    }, []);

    const handleSuccess = useCallback(() => {
        setIsPending(false);
        setError(null);
        setIsReady(true);
    }, []);

    const handleError = useCallback((err) => {
        setIsPending(false);
        setError(err);
        setIsReady(false);
    }, []);

    const reset = useCallback(() => {
        setIsPending(false);
        setError(null);
        setIsReady(false);
    }, []);

    return {
        isPending,
        error,
        isReady,
        startRequest,
        handleSuccess,
        handleError,
        reset
    };
};


