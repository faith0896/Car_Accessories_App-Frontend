// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import CartPage from "./pages/CartPage.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import SuperAdminDashboard from "./pages/SuperAdminDashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";

import { useState, useEffect } from "react";

function Layout() {
    const {
        logout,
        isAuthenticated,
        setUser
    } = useAuth();

    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    useEffect(() => {
        const handleOpenRegister = () => {
            setShowLogin(false);
            setShowRegister(true);
        };
        window.addEventListener("open-register", handleOpenRegister);
        return () => window.removeEventListener("open-register", handleOpenRegister);
    }, []);

    useEffect(() => {
        const handleOpenLogin = () => {
            setShowRegister(false);
            setShowLogin(true);
        };
        window.addEventListener("open-login", handleOpenLogin);
        return () => window.removeEventListener("open-login", handleOpenLogin);
    }, []);

    return (
        <div className="page-wrapper">
            <Navbar
                isLoggedIn={isAuthenticated()}
                onLoginClick={() => setShowLogin(true)}
                onLogoutClick={logout}
            />

            <main className="main-content">
                <Outlet />
            </main>

            <Footer />

            {showLogin && (
                <Login
                    onLogin={(loggedInUser) => {
                        setUser(loggedInUser);
                        const role = loggedInUser.role?.toUpperCase();
                        if (role === "SUPER_ADMIN") {
                            window.history.pushState({}, "", "/super-admin-dashboard");
                        } else if (role === "ADMIN") {
                            window.history.pushState({}, "", "/admin-dashboard");
                        } else {
                            window.history.pushState({}, "", "/");
                        }
                        window.dispatchEvent(new PopStateEvent("popstate"));
                        setShowLogin(false);
                    }}
                    onClose={() => setShowLogin(false)}
                />
            )}

            {showRegister && <Register onClose={() => setShowRegister(false)} />}
        </div>
    );
}

function ProtectedRoute({ children, condition }) {
    return condition ? children : <Navigate to="/" />;
}

function AppRoutes() {
    const { isAdmin, isSuperAdmin, isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />

                {/* ✅ FIXED: Allow both admins and superadmins to access this */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute condition={isAdmin() || isSuperAdmin()}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/super-admin-dashboard"
                    element={
                        <ProtectedRoute condition={isSuperAdmin()}>
                            <SuperAdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                    path="/payment"
                    element={
                        <ProtectedRoute condition={isAuthenticated()}>
                            <PaymentPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Route>
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}
