import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/CarAccessories/api/superadmin';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Get all active users
 * @returns {Promise<Object>} List of users
 */
export const getAllUsers = async () => {
    try {
        const response = await api.get('/users');
        return {
            success: true,
            users: response.data,
        };
    } catch (error) {
        console.error('Get users error:', error);
        return {
            success: false,
            error: error.response?.data?.error || 'Failed to fetch users',
            status: error.response?.status
        };
    }
};

/**
 * Get users by role
 * @param {string} role - User role (ADMIN, BUYER, SUPER_ADMIN)
 * @returns {Promise<Object>} List of users with specified role
 */
export const getUsersByRole = async (role) => {
    try {
        const response = await api.get(`/users/role/${role}`);
        return {
            success: true,
            users: response.data,
        };
    } catch (error) {
        console.error('Get users by role error:', error);
        return {
            success: false,
            error: error.response?.data?.error || 'Failed to fetch users by role',
            status: error.response?.status
        };
    }
};

/**
 * Delete any user (including admins)
 * @param {number} userId - ID of user to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/users/${userId}`);
        return {
            success: true,
            message: response.data.message,
        };
    } catch (error) {
        console.error('Delete user error:', error);
        return {
            success: false,
            error: error.response?.data?.error || 'Failed to delete user',
            status: error.response?.status
        };
    }
};

/**
 * Toggle user active status
 * @param {number} userId - ID of user
 * @param {boolean} isActive - New active status
 * @returns {Promise<Object>} Update result
 */
export const toggleUserStatus = async (userId, isActive) => {
    try {
        const response = await api.put(`/users/${userId}/toggle-status`, { isActive });
        return {
            success: true,
            message: response.data.message,
        };
    } catch (error) {
        console.error('Toggle user status error:', error);
        return {
            success: false,
            error: error.response?.data?.error || 'Failed to update user status',
            status: error.response?.status
        };
    }
};

/**
 * Reset user password (admin function)
 * @param {number} userId - ID of user
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Reset result
 */
export const resetUserPassword = async (userId, newPassword) => {
    try {
        const response = await api.put(`/users/${userId}/reset-password`, { newPassword });
        return {
            success: true,
            message: response.data.message,
        };
    } catch (error) {
        console.error('Reset user password error:', error);
        return {
            success: false,
            error: error.response?.data?.error || 'Failed to reset user password',
            status: error.response?.status
        };
    }
};

/**
 * Get user statistics
 * @returns {Promise<Object>} Statistics data
 */
export const getUserStatistics = async () => {
    try {
        const response = await api.get('/statistics');
        return {
            success: true,
            statistics: response.data,
        };
    } catch (error) {
        console.error('Get statistics error:', error);
        return {
            success: false,
            error: error.response?.data?.error || 'Failed to fetch statistics',
            status: error.response?.status
        };
    }
};

/**
 * Get SuperAdmin profile
 * @param {string} email - SuperAdmin email
 * @returns {Promise<Object>} Profile data
 */
export const getSuperAdminProfile = async (email) => {
    try {
        const response = await api.get(`/profile/${email}`);
        return {
            success: true,
            profile: response.data,
        };
    } catch (error) {
        console.error('Get profile error:', error);
        return {
            success: false,
            error: error.response?.data?.error || 'Failed to fetch profile',
            status: error.response?.status
        };
    }
};

/**
 * Create initial SuperAdmin (for system setup)
 * @param {Object} adminData - SuperAdmin data
 * @returns {Promise<Object>} Creation result
 */
export const createInitialSuperAdmin = async (adminData) => {
    try {
        const response = await api.post('/create-initial', adminData);
        return {
            success: true,
            message: response.data.message,
            userId: response.data.userId,
        };
    } catch (error) {
        console.error('Create initial SuperAdmin error:', error);
        return {
            success: false,
            error: error.response?.data?.error || 'Failed to create SuperAdmin',
            status: error.response?.status
        };
    }
};

/**
 * Check permissions for user deletion
 * @param {string} targetRole - Role of user to be deleted
 * @param {string} currentRole - Role of current user
 * @returns {Promise<Object>} Permission result
 */
export const checkDeletePermission = async (targetRole, currentRole) => {
    try {
        const response = await api.get(`/permissions/can-delete/${targetRole}`, {
            params: { currentRole }
        });
        return {
            success: true,
            canDelete: response.data.canDelete,
        };
    } catch (error) {
        console.error('Check permission error:', error);
        return {
            success: false,
            error: error.response?.data?.error || 'Failed to check permissions',
            status: error.response?.status
        };
    }
};

/**
 * Get system health status
 * @returns {Promise<Object>} System health data
 */
export const getSystemHealth = async () => {
    try {
        const response = await api.get('/system/health');
        return {
            success: true,
            health: response.data,
        };
    } catch (error) {
        console.error('Get system health error:', error);
        return {
            success: false,
            error: error.response?.data?.error || 'Failed to fetch system health',
            status: error.response?.status
        };
    }
};

// Export default object with all functions
export default {
    getAllUsers,
    getUsersByRole,
    deleteUser,
    toggleUserStatus,
    resetUserPassword,
    getUserStatistics,
    getSuperAdminProfile,
    createInitialSuperAdmin,
    checkDeletePermission,
    getSystemHealth
};
