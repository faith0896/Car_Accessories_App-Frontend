import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllOrders, getMyOrders } from "../services/Api.js";
import { useAuth } from "../context/AuthContext.jsx";
import placeholder from "../Images/logo.jpg";

const BASE_URL = "http://localhost:8080/CarAccessories";

function resolveImageFromProduct(product) {
    if (!product) return placeholder;
    const raw = product.imageURL || product.imageUrl || product.image || product.imagePath || "";
    if (!raw) return placeholder;
    if (raw.startsWith("http")) return raw;
    if (raw.startsWith("/")) return `${BASE_URL}${raw}`;
    return `${BASE_URL}/uploads/images/${raw}`;
}

function getProductFromItem(item) {
    if (!item) return null;
    if (item.product && typeof item.product === 'object') return item.product;
    if (item.productDetail && typeof item.productDetail === 'object') return item.productDetail;
    if (item.productId && typeof item.productId === 'object' && (item.productId.product || item.productId.name)) return item.productId;
    return null;
}

export default function Orders() {
    const location = useLocation();
    const { isBuyer } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const newOrder = location.state?.orderData;
                let fetchedOrders = [];

                if (newOrder) {
                    fetchedOrders = [newOrder];
                } else if (isBuyer()) {
                    const response = await getMyOrders();
                    fetchedOrders = response.data || [];
                } else {
                    const response = await getAllOrders();
                    fetchedOrders = response.data || [];
                }

                // Map product details to items if present
                const ordersWithProducts = fetchedOrders.map(order => {
                    const items = order.orderDetails || order.orderItems || order.items || [];
                    const detailedItems = items.map(item => {
                        const product = getProductFromItem(item) || item.product || null;
                        return { ...item, product };
                    });
                    return { ...order, orderDetails: detailedItems };
                });

                setOrders(ordersWithProducts);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Failed to fetch orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [location.state, isBuyer]);

    if (loading) return <p>Loading orders...</p>;
    if (error) return <p>{error}</p>;
    if (!orders.length) return <p>No orders found.</p>;

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? dateStr : date.toLocaleString();
    };

    return (
        <div className="orders-container">
            <h2 className="orders-title">Order History</h2>
            <div className="orders-body">
                <div className="orders-inner">
                    {orders.map(order => (
                        <div key={order.orderId} className="order-card">
                            <div className="order-header">
                                <p>{formatDate(order.orderDate)}</p>
                                <p>Order NO. {order.orderId}</p>
                            </div>

                            <div className="order-row">
                                <div className="order-left">
                                    {order.orderDetails && order.orderDetails.length > 0 && (
                                        <div className="order-items">
                                            {order.orderDetails.map((item, index) => {
                                                const product = item.product;
                                                const productName = product?.name || item.productName || item.name || 'Product';
                                                const imageSrc = resolveImageFromProduct(product);

                                                return (
                                                    <div key={index} className="order-item">
                                                        {(product?.shopName || item.shopName) && (
                                                            <div className="item-shop">{product?.shopName || item.shopName}</div>
                                                        )}
                                                        <div className="item-image">
                                                            <img src={imageSrc} alt={productName} />
                                                            <div className="item-meta">
                                                                <p className="item-name">{productName}</p>
                                                                <p className="item-qty">{item.quantity || 1} item{(item.quantity || 1) > 1 ? "s" : ""}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="order-separator" aria-hidden></div>

                                <div className="order-right">
                                    <div className="order-price">R{order.payment?.amount || 0}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                html, body, #root {
                    height: 100%;
                    margin: 0;
                    background-color: #f0f0f0;
                }
                .orders-container {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    min-height: 100vh;
                    background: #f0f0f0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .orders-title {
                    text-align: center;
                    margin-bottom: 12px;
                    font-size: 1.8rem;
                    font-weight: bold;
                    width: 100%;
                    max-width: 980px;
                    color: black;
                }
                .orders-body {
                    width: 100%;
                    max-width: 980px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: calc(100vh - 120px);
                }
                .orders-inner { width: 100%; }
                .order-card {
                    background: #f3efefff;
                    border-radius: 8px;
                    padding: 12px;
                    margin: 12px auto 20px auto;
                    border: 1px solid #e0e0e0;
                    max-width: 980px;
                }
                .order-header {
                    margin-bottom: 12px;
                    font-size: 0.9rem;
                    color: #333;
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .order-header p { margin: 2px 0; }
                .order-row { display: flex; gap: 16px; align-items: stretch; }
                .order-left { flex: 1; }
                .order-separator { width: 1px; background: #e6e6e6; border-radius: 1px; }
                .order-right { width: 140px; display: flex; align-items: center; justify-content: center; }
                .order-price { font-size: 1.1rem; font-weight: 400; color: #111; }
                .order-items { display: flex; flex-direction: column; gap: 8px; }
                .order-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px;
                    border: 1px solid #e6e6e6;
                    border-radius: 6px;
                    background: #f3efefff;
                }
                .item-shop {
                    width: 140px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    color:#222;
                }
                .item-image {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    text-align: left;
                    flex: 1;
                    gap: 12px;
                    color: grey;
                }
                .item-image img {
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 4px;
                }
                .item-meta {
                    display: flex;
                    flex-direction: column;
                }
                .item-name { margin: 0; font-size: 0.95rem; color: #333; }
                .item-qty { margin: 0; font-size: 0.85rem; color: #666; }
                @media (max-width: 800px) {
                    .order-row { flex-direction: column; }
                    .order-separator { display: none; }
                    .order-right { width: 100%; }
                    .order-item { flex-direction: row; }
                }
            `}</style>
        </div>
    );
}

