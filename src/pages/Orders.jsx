import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllOrders, getMyOrders, updateOrderStatus, deleteOrder } from "../services/Api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Orders() {
    const location = useLocation();
    const { user, isBuyer } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const newOrder = location.state?.orderData;
                if (newOrder) {
                    setOrders([newOrder]);
                } else if (isBuyer()) {
                    const response = await getMyOrders();
                    setOrders(response.data || []);
                } else {
                    const response = await getAllOrders();
                    setOrders(response.data || []);
                }
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

    const canModify = (status) => {
        if (!status) return false;
        const editableStatuses = ["PENDING", "PROCESSING"];
        return editableStatuses.includes(status.toUpperCase());
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) return;

        try {
            setUpdatingOrderId(orderId);
            await updateOrderStatus(orderId, newStatus);
            setOrders((prev) =>
                prev.map((o) =>
                    o.orderId === orderId ? { ...o, status: newStatus } : o
                )
            );
            alert(`Order ${orderId} status updated to ${newStatus}`);
        } catch (err) {
            console.error("Failed to update order status", err);
            alert("Failed to update order status. Please try again.");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm(`Are you sure you want to cancel order ${orderId}?`)) return;

        try {
            setUpdatingOrderId(orderId);
            await deleteOrder(orderId);
            setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
            alert(`Order ${orderId} cancelled successfully`);
        } catch (err) {
            console.error("Failed to cancel order", err);
            alert("Failed to cancel order. Please try again.");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    return (
        <div className="orders-container">
            <h2 className="orders-title">Order History</h2>
            <div className="orders-grid">
                {orders.map((order) => (
                    <div key={order.orderId} className="order-card">
                        <p className="order-id"><strong>Order ID:</strong> {order.orderId}</p>
                        <p className="order-status"><strong>Status:</strong> {order.status || "N/A"}</p>
                        <p className="order-date"><strong>Order Date:</strong> {formatDate(order.orderDate)}</p>

                        <div className="payment-info">
                            <strong>Payment:</strong>{" "}
                            {order.payment
                                ? `${order.payment.amount || 0} (${order.payment.status?.toUpperCase() || "PAID"})`
                                : "PAID"}
                        </div>

                        {canModify(order.status) && (
                            <div className="order-actions">
                                <button
                                    disabled={updatingOrderId === order.orderId}
                                    onClick={() => handleUpdateStatus(order.orderId, "UPDATED")}
                                    title="Mark order as updated"
                                >
                                    Update
                                </button>
                                <button
                                    disabled={updatingOrderId === order.orderId}
                                    onClick={() => handleUpdateStatus(order.orderId, "CANCELLED")}
                                    title="Cancel this order"
                                    style={{ marginLeft: "10px", color: "red" }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
                .orders-container { font-family: Arial; padding: 20px; background: #f5f5f5; min-height: 100vh; }
                .orders-title { text-align: center; margin-bottom: 20px; font-size: 1.8rem; font-weight: bold; }
                .orders-grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
                .order-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; }
                .order-card:hover { transform: translateY(-3px); box-shadow: 0 6px 14px rgba(0,0,0,0.15); }
                .order-id { font-weight: 600; font-size: 1.1rem; }
                .order-date, .order-status { font-size: 0.9rem; color: #666; }
                .payment-info { margin-top: 12px; font-size: 0.95rem; color: #333; }
                .order-actions { margin-top: 15px; }
                button { padding: 8px 12px; font-size: 0.9rem; cursor: pointer; border-radius: 6px; border: 1px solid #ccc; background-color: #eee; }
                button:disabled { cursor: not-allowed; opacity: 0.6; }
            `}</style>
        </div>
    );
}
