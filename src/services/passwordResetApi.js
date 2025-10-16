import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/CarAccessories/api/password-reset';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request password reset - sends email with reset token
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Response with success/error message
 */
export const requestPasswordReset = async (email) => {
    try {
        const response = await api.post('/request', { email });
        return {
            success: true,
            message: response.data.message,
            ...response.data
        };
    } catch (error) {
        console.error('Password reset request error:', error);

        if (error.response) {
            return {
                success: false,
                error: error.response.data.error || 'Failed to send reset email',
                status: error.response.status
            };
        }

        return {
            success: false,
            error: 'Network error. Please check your connection and try again.'
        };
    }
};

/**
 * Validate reset token
 * @param {string} token - Reset token from email
 * @param {string} email - Optional email parameter
 * @returns {Promise<Object>} Validation result
 */
export const validateResetToken = async (token, email = null) => {
    try {
        const params = { token };
        if (email) params.email = email;

        const response = await api.get('/validate', { params });
        return {
            valid: true,
            ...response.data
        };
    } catch (error) {
        console.error('Token validation error:', error);

        if (error.response) {
            return {
                valid: false,
                error: error.response.data.error || 'Invalid or expired token',
                status: error.response.status
            };
        }

        return {
            valid: false,
            error: 'Network error. Please check your connection and try again.'
        };
    }
};

/**
 * Reset password using valid token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Password confirmation
 * @returns {Promise<Object>} Reset result
 */
export const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
        const response = await api.post('/reset', {
            token,
            newPassword,
            confirmPassword
        });

        return {
            success: true,
            message: response.data.message,
            ...response.data
        };
    } catch (error) {
        console.error('Password reset error:', error);

        if (error.response) {
            return {
                success: false,
                error: error.response.data.error || 'Failed to reset password',
                status: error.response.status
            };
        }

        return {
            success: false,
            error: 'Network error. Please check your connection and try again.'
        };
    }
};

/**
 * Check if user can request password reset (rate limiting check)
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Eligibility result
 */
export const canRequestPasswordReset = async (email) => {
    try {
        const response = await api.get('/can-request', {
            params: { email }
        });

        return {
            canRequest: response.data.canRequest,
            message: response.data.message,
            ...response.data
        };
    } catch (error) {
        console.error('Reset eligibility check error:', error);

        if (error.response) {
            return {
                canRequest: false,
                error: error.response.data.error || 'Failed to check eligibility',
                status: error.response.status
            };
        }

        return {
            canRequest: false,
            error: 'Network error. Please check your connection and try again.'
        };
    }
};

/**
 * Get reset statistics (admin only)
 * @param {string} authToken - Admin authentication token
 * @returns {Promise<Object>} Statistics data
 */
export const getResetStatistics = async (authToken) => {
    try {
        const response = await api.get('/statistics', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        return {
            success: true,
            ...response.data
        };
    } catch (error) {
        console.error('Reset statistics error:', error);

        if (error.response) {
            return {
                success: false,
                error: error.response.data.error || 'Failed to fetch statistics',
                status: error.response.status
            };
        }

        return {
            success: false,
            error: 'Network error. Please check your connection and try again.'
        };
    }
};

/**
 * Cleanup expired tokens (admin only)
 * @param {string} authToken - Admin authentication token
 * @returns {Promise<Object>} Cleanup result
 */
export const cleanupExpiredTokens = async (authToken) => {
    try {
        const response = await api.post('/cleanup', {}, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        return {
            success: true,
            message: response.data.message,
            ...response.data
        };
    } catch (error) {
        console.error('Token cleanup error:', error);

        if (error.response) {
            return {
                success: false,
                error: error.response.data.error || 'Failed to cleanup tokens',
                status: error.response.status
            };
        }

        return {
            success: false,
            error: 'Network error. Please check your connection and try again.'
        };
    }
};

// Export default object with all functions
export default {
    requestPasswordReset,
    validateResetToken,
    resetPassword,
    canRequestPasswordReset,
    getResetStatistics,
    cleanupExpiredTokens
};
