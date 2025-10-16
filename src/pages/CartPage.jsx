import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";  // assume you have this
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createCart, updateCart, purchaseProduct } from "../services/Api.js";
import { useState, useEffect } from "react";

export default function CartPage({ onClose }) {
  const {
    cartItems = [],
    removeFromCart,
    updateQuantity,
    clearCart,
    userId,
    cartId,
  } = useCart();

  const { isAdmin } = useAuth();  // assuming your AuthContext gives this
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Prevent admin from checking out / using this page
  useEffect(() => {
    if (isAdmin()) {
      alert("Admins are not allowed to perform checkout.");
      // Redirect to home or admin dashboard
      navigate("/");
    }
  }, [isAdmin, navigate]);

  const handleQuantityChange = (productId, quantity) => {
    let qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    updateQuantity(productId, qty);
  };

  const cartTotal = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
  );

  const handleCheckout = async () => {
    if (isAdmin()) {
      alert("Admins are not allowed to checkout.");
      return;
    }
    if (!cartItems.length) {
      alert("Your cart is empty.");
      return;
    }
    if (!userId) {
      alert("User not logged in.");
      return;
    }

    setLoading(true);

    try {
      const cartPayload = {
        id: cartId || null,
        buyer: { userId },
        cartItems: cartItems.map((item) => ({
          quantity: item.quantity,
          product: { productId: item.productId || item.id },
        })),
      };

      if (cartId) {
        await updateCart(cartPayload);
      } else {
        const res = await createCart(cartPayload);
        const newCartId = res?.data?.cartId || res?.data?.id;
        if (newCartId) {
          // If you have a method in your CartContext to set cartId, call it
          // setCartId(newCartId)
        }
      }

      for (const item of cartItems) {
        const pid = item.productId || item.id;
        const qty = item.quantity;
        try {
          await purchaseProduct(pid, qty);
        } catch (err) {
          console.error(`Failed to decrease stock for ${pid}`, err);
          alert(`Stock update failed for "${item.name}".`);
        }
      }

      localStorage.setItem("cart", JSON.stringify(cartItems));
      clearCart();
      if (onClose) onClose();
      navigate("/payment", { state: { cartItems } });
    } catch (error) {
      console.error("Checkout error:", error.response?.data || error.message);
      alert("Could not complete checkout. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="cart-container">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-cart" onClick={onClose} aria-label="Close cart">
            ✖
          </button>
        </div>

        {cartItems.length === 0 ? (
            <p className="empty-cart">Your cart is empty.</p>
        ) : (
            <div className="cart-box">
              {cartItems.map((item) => (
                  <div key={item.productId || item.id} className="cart-item-card">
                    <div className="cart-item-left">
                      <img
                          src={item.imageURL || item.image}
                          alt={item.name}
                          className="cart-item-image"
                      />
                      <div className="cart-item-info">
                        <h3>{item.name}</h3>
                        <p>R {item.price?.toFixed(2)}</p>
                        <input
                            type="number"
                            value={item.quantity}
                            min="1"
                            className="quantity-input"
                            onChange={(e) =>
                                handleQuantityChange(item.productId || item.id, e.target.value)
                            }
                        />
                        <p className="item-total">
                          R {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.productId || item.id)}
                        title="Remove item"
                        aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
              ))}

              <h2 className="cart-total">Total: R {cartTotal.toFixed(2)}</h2>

              <div className="checkout-section">
                <p className="delivery-info">Order will be delivered in 3–5 working days.</p>
                <button
                    className="checkout-btn"
                    onClick={handleCheckout}
                    disabled={loading}
                >
                  {loading ? "Processing..." : "Checkout"}
                </button>
              </div>
            </div>
        )}

        <style>{`
        .cart-container { padding: 20px; }
        .cart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .close-cart { background: none; border: none; font-size: 1.4rem; cursor: pointer; }
        .empty-cart { text-align: center; font-size: 18px; color: #555; }
        .cart-box { display: flex; flex-direction: column; gap: 15px; }
        .cart-item-card { display: flex; justify-content: space-between; align-items: center; border: 1px solid #ddd; padding: 15px; border-radius: 10px; background: #fff; }
        .cart-item-left { display: flex; align-items: center; gap: 15px; }
        .cart-item-image { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; }
        .cart-item-info h3 { margin: 0 0 5px; }
        .quantity-input { width: 50px; padding: 5px; border-radius: 5px; border: 1px solid #ccc; margin-top: 5px; }
        .item-total { font-weight: 600; margin-top: 5px; }
        .remove-btn { background: none; border: none; cursor: pointer; color: #c00; }
        .cart-total { margin-top: 10px; font-weight: 700; }
        .checkout-section { margin-top: 15px; text-align: center; }
        .delivery-info { margin-bottom: 10px; color: #666; }
        .checkout-btn {
          background-color: #1e40af;
          color: white;
          padding: 10px 25px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .checkout-btn:disabled {
          background-color: #8b93b3;
          cursor: not-allowed;
        }
        .checkout-btn:hover:not(:disabled) {
          background-color: #2563eb;
        }
      `}</style>
      </div>
  );
}
