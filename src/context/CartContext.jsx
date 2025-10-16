import React, { createContext, useState, useContext, useEffect } from "react";
import {
    createCart,
    updateCartItem,
    deleteCartItem,
    getCart,
} from "../services/Api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user, token, loading } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [cartId, setCartId] = useState(null);
    const [userId, setUserId] = useState(null);

    const [lastOrder, setLastOrder] = useState(() => {
        try {
            const savedOrder = localStorage.getItem("lastOrder");
            return savedOrder ? JSON.parse(savedOrder) : null;
        } catch {
            return null;
        }
    });

    // Set userId once auth is ready
    useEffect(() => {
        if (loading) return; // wait for auth loading

        if (!user || !token) {
            console.log("No logged-in user detected. Skipping cart setup.");
            setUserId(null);
            setCartItems([]);
            setCartId(null);
            return;
        }

        if (user.userId) {
            setUserId(user.userId);
        } else {
            console.warn("Logged-in user has no userId");
            setUserId(null);
        }
    }, [user, token, loading]);

    // Fetch cart when userId changes
    useEffect(() => {
        const fetchCart = async () => {
            if (!userId) return;

            try {
                const res = await getCart(userId);
                const items = res?.data?.cartItems ?? [];
                const cid = res?.data?.cartId ?? null;

                setCartItems(Array.isArray(items) ? items : []);
                setCartId(cid);
            } catch (error) {
                console.error("Error fetching cart:", error.response?.data || error.message);
                setCartItems([]);
                setCartId(null);
            }
        };

        fetchCart();
    }, [userId]);

    // Helper to get product unique key
    const keyOf = (p) => p.productId ?? p.id;

    // Add product to cart or increase quantity if exists
    const addToCart = async (product) => {
        const id = keyOf(product);
        const existing = cartItems.find((item) => keyOf(item) === id);

        if (existing) {
            updateQuantity(id, existing.quantity + 1);
            return;
        }

        const newItem = { ...product, quantity: 1 };
        const updatedItems = [...cartItems, newItem];
        setCartItems(updatedItems);

        try {
            if (cartId && userId) {
                await createCart({ buyer: { userId }, cartItems: updatedItems });
            }
        } catch (error) {
            console.error("Error adding to cart:", error.response?.data || error.message);
        }
    };

    // Remove product from cart
    const removeFromCart = async (productId) => {
        const toRemove = cartItems.find((item) => keyOf(item) === productId);
        if (!toRemove) return;

        const updatedItems = cartItems.filter((item) => keyOf(item) !== productId);
        setCartItems(updatedItems);

        try {
            if (cartId && toRemove.cartItemId) {
                await deleteCartItem(cartId, toRemove.cartItemId);
            }
        } catch (error) {
            console.error("Error removing from cart:", error.response?.data || error.message);
        }
    };

    // Update quantity of a cart item
    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        const item = cartItems.find((item) => keyOf(item) === productId);
        if (!item) return;

        const updatedItems = cartItems.map((it) =>
            keyOf(it) === productId ? { ...it, quantity: Number(quantity) } : it
        );
        setCartItems(updatedItems);

        try {
            if (cartId && item.cartItemId) {
                await updateCartItem(cartId, item.cartItemId, { quantity: Number(quantity) });
            }
        } catch (error) {
            console.error("Error updating cart item:", error.response?.data || error.message);
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        const snapshot = [...cartItems];
        setCartItems([]);
        localStorage.removeItem("cart");

        try {
            if (cartId) {
                for (const item of snapshot) {
                    if (item.cartItemId) {
                        await deleteCartItem(cartId, item.cartItemId);
                    }
                }
            }
        } catch (error) {
            console.error("Error clearing cart:", error.response?.data || error.message);
        }
    };

    // Save last order to state and localStorage
    const saveLastOrder = (order) => {
        setLastOrder(order);
        try {
            localStorage.setItem("lastOrder", JSON.stringify(order));
        } catch {}

    };

    // Clear last order
    const clearLastOrder = () => {
        setLastOrder(null);
        localStorage.removeItem("lastOrder");
    };

    // Count total items quantity in cart
    const cartCount = cartItems.reduce((acc, it) => acc + (it.quantity || 0), 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                lastOrder,
                saveLastOrder,
                clearLastOrder,
                cartId,
                userId,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}