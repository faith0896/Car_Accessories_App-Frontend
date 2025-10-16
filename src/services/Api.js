import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/CarAccessories",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// AUTH
export const registerUser = (userData) => api.post("/auth/register", userData);
export const loginUser = (credentials) =>
    api.post("/auth/login", {
        username: credentials.username || credentials.email,
        password: credentials.password,
    });
export const getLoggedUser = () => api.get("/auth/me");

// BUYER
export const getBuyerByEmail = (email) => api.get(`/buyer/read/${email}`);

// PRODUCT
export const getProducts = () => api.get("/product/all");
export const getProductById = (productId) => api.get(`/product/${productId}`);
export const purchaseProduct = (productId, quantity) =>
    api.post(`/product/purchase/${productId}?quantity=${quantity}`);

// CART
export const createCart = (cartData) => api.post("/cart/checkout", cartData);
export const updateCart = (cartData) => api.post("/cart/update", cartData);
export const getCart = (buyerId) => api.get(`/cart/by-buyer/${buyerId}`);

// CART ITEM
export const updateCartItem = (cartId, cartItemId, data) =>
    api.put(`/cart/${cartId}/items/${cartItemId}`, data);
export const deleteCartItem = (cartId, cartItemId) =>
    api.delete(`/cart/${cartId}/items/${cartItemId}`);
export const getCartItemsByCartId = (cartId) =>
    api.get(`/cart-item/cart/${cartId}`);

// ORDER
export const getAllOrders = () => api.get("/order/all");
export const getOrdersByBuyerId = (buyerId) => api.get(`/order/buyer/${buyerId}`);
export const createOrder = (orderData) => api.post("/order/create", orderData);
export const getOrderById = (orderId) => api.get(`/order/read/${orderId}`);
export const updateOrder = (orderData) => api.put("/order/update", orderData);
export const updateOrderStatus = (orderId, status) =>
    api.put(`/order/status/update/${orderId}?status=${status}`);
export const cancelOrder = (orderId) => updateOrderStatus(orderId, "CANCELLED");
export const deleteOrder = (orderId) => api.delete(`/order/delete/${orderId}`);

// NEW: Get logged-in user's orders securely (no buyerId param)
export const getMyOrders = () => api.get("/order/my-orders");

// PAYMENT
export const createPayment = (paymentData) =>
    api.post("/payment/create", paymentData);

// REVIEW
export const getReviewsByProductId = (productId) =>
    api.get(`/review/product/${productId}`);

export const createReview = (reviewData) =>
    api.post("/review/create", reviewData);

export default api;
