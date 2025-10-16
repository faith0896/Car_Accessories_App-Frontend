import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js"; // ✅ Must include .js
import { CartProvider } from "./context/CartContext.jsx"; // ✅ Must include .jsx
import { AuthProvider } from "./context/AuthContext.jsx"; // ✅ Must include .jsx

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <AuthProvider>
            <CartProvider>
                <App />
            </CartProvider>
        </AuthProvider>
    </React.StrictMode>
);