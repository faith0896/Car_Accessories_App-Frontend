import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Setup axios auth header on token change
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // On mount, load token and user from localStorage and validate
    useEffect(() => {
        const loadUserFromStorage = () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(parsedUser);
                } catch (error) {
                    console.error('Failed to parse user from localStorage', error);
                    logout(); // Clear invalid data
                }
            }
            setLoading(false);
        };

        loadUserFromStorage();
    }, []);

    // Login function: sets user and token on success, saves to localStorage
    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:8080/CarAccessories/auth/login', {
                username: email,
                password: password,
            });

            const userData = response.data;

            if (!userData.token) {
                throw new Error('No token received from login');
            }

            localStorage.setItem('token', userData.token);
            localStorage.setItem('user', JSON.stringify(userData));

            setToken(userData.token);
            setUser(userData);

            return userData;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            const response = await axios.post('http://localhost:8080/CarAccessories/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    // Logout function: clear all stored info and axios header
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    // Role helpers
    const isAdmin = () => user?.role?.toUpperCase() === 'ADMIN';
    const isSuperAdmin = () => user?.role?.toUpperCase() === 'SUPER_ADMIN';
    const isSuperAdminOrAdmin = () => isAdmin() || isSuperAdmin();
    const isBuyer = () => user?.role?.toUpperCase() === 'BUYER';
    const isAuthenticated = () => !!user && !!token;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                register,
                isAdmin,
                isSuperAdmin,
                isSuperAdminOrAdmin,
                isBuyer,
                isAuthenticated,
                setUser, // optional but useful
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
