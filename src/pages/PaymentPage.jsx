import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { createOrder, createPayment } from "../services/Api.js";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  const cartFromState = location.state?.cartItems || [];
  const cartFromStorage = (() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  })();

  const [cartItems, setCartItems] = useState([]);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
    bankName: "",
    accountNumber: "",
  });

  const banks = ["FNB", "Standard Bank", "ABSA", "Nedbank", "Capitec", "Investec"];

  useEffect(() => {
    const items = cartFromState.length ? cartFromState : cartFromStorage;
    setCartItems(items);
    const randomOrder = "ORD" + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(randomOrder);
  }, [location.key]);

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = 50;
  const vat = (subtotal + deliveryFee) * 0.15;
  const grandTotal = subtotal + deliveryFee + vat;

  const handlePlaceOrder = async () => {
    if (!cartItems.length) {
      alert("Your cart is empty.");
      return;
    }

    const trimmedDelivery = Object.fromEntries(
        Object.entries(deliveryInfo).map(([k, v]) => [k, (v || "").trim()])
    );
    if (Object.values(trimmedDelivery).some((val) => !val)) {
      alert("Please fill in all delivery details.");
      return;
    }

    // ✅ Get logged-in buyer from localStorage
    const buyer = JSON.parse(localStorage.getItem("user"));
    if (!buyer?.userId) {
      alert("Buyer information is missing. Please log in again.");
      return;
    }

    // ✅ Prepare orderItems with nested product
    const orderItems = cartItems.map((item) => ({
      product: {
        productId: item.productId || item.id,
      },
      quantity: item.quantity,
      priceAtPurchase: item.price,
    }));

    // ✅ Construct orderData matching backend structure
    const orderData = {
      orderNumber,
      contactName: trimmedDelivery.fullName,
      contactPhone: trimmedDelivery.phone,
      deliveryAddress: `${trimmedDelivery.address}, ${trimmedDelivery.city}, ${trimmedDelivery.postalCode}`,
      orderItems,
      paymentMethod,
      subtotal,
      deliveryFee,
      vat,
      grandTotal,
      status: "PENDING",
      buyer: {
        userId: buyer.userId,
      },
    };

    try {
      const orderResponse = await createOrder(orderData);
      const savedOrder = orderResponse.data;

      // ✅ Create payment with nested orderId
      const paymentData = {
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod,
        amount: grandTotal,
        status: paymentMethod === "eft" ? "PENDING" : "PAID",
        order: {
          orderId: savedOrder.orderId,
        },
      };

      await createPayment(paymentData);

      // ✅ Store order, clear cart, navigate
      localStorage.setItem("latestOrder", JSON.stringify(savedOrder));
      clearCart();
      localStorage.removeItem("cart");

      navigate("/orders", { state: { orderData: savedOrder } });
    } catch (error) {
      console.error("Error placing order:", error);

      // Extract meaningful error message
      let errorMessage = "Failed to place order. Please check your details and try again.";

      if (error?.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    }
  };

  return (
      <div className="payment-page">
        <div className="main-content">
          {/* Delivery Address Section */}
          <div className="section">
            <h3>Delivery Address</h3>
            {["fullName", "address", "city", "postalCode", "phone"].map((field) => (
                <label key={field}>
                  {field === "fullName"
                      ? "Full Name:"
                      : field.charAt(0).toUpperCase() + field.slice(1) + ":"}
                  <input
                      type="text"
                      name={field}
                      value={deliveryInfo[field]}
                      onChange={handleDeliveryChange}
                  />
                </label>
            ))}
          </div>

          {/* Order Details Section */}
          <div className="section">
            <h3>Order Details</h3>
            <div className="order-items">
              {cartItems.map((item) => (
                  <div key={item.productId || item.id} className="order-item">
                    <img src={item.imageURL || item.image} alt={item.name} />
                    <span>
                  {item.name} x {item.quantity}
                </span>
                    <span>R{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
              ))}
            </div>
            <p className="shipping-title">Your Shipping</p>
            <p className="shipping-info">
              3-5 Business Days. Please pay attention to phone/text messages from
              the logistics provider.
            </p>
          </div>

          {/* Payment Method Section */}
          <div className="section" id="payment-section">
            <h3>Payment Method</h3>
            <div className="payment-method">
              <label>
                <input
                    type="radio"
                    name="method"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                />
                Credit/Debit Card
              </label>
              <label>
                <input
                    type="radio"
                    name="method"
                    value="eft"
                    checked={paymentMethod === "eft"}
                    onChange={() => setPaymentMethod("eft")}
                />
                Bank Transfer (EFT)
              </label>
            </div>

            {/* Card Form */}
            {paymentMethod === "card" ? (
                <div className="payment-form">
                  {["cardholderName", "cardNumber", "expiryMonth", "expiryYear", "cvv"].map(
                      (field) => (
                          <label key={field}>
                            {field === "cardholderName"
                                ? "Cardholder Name:"
                                : field.charAt(0).toUpperCase() + field.slice(1) + ":"}
                            <input
                                type="text"
                                name={field}
                                value={paymentInfo[field]}
                                onChange={(e) =>
                                    setPaymentInfo({ ...paymentInfo, [field]: e.target.value })
                                }
                                placeholder={
                                  field === "cardNumber" ? "1234 5678 9012 3456" : ""
                                }
                                maxLength={
                                  field === "cardNumber"
                                      ? 16
                                      : field === "cvv"
                                          ? 3
                                          : field === "expiryMonth" || field === "expiryYear"
                                              ? 2
                                              : undefined
                                }
                            />
                          </label>
                      )
                  )}
                </div>
            ) : (
                <div className="payment-form">
                  <label>
                    Select Your Bank:
                    <select
                        name="bankName"
                        value={paymentInfo.bankName}
                        onChange={(e) =>
                            setPaymentInfo({ ...paymentInfo, bankName: e.target.value })
                        }
                    >
                      <option value="">--Select Bank--</option>
                      {banks.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Account Number:
                    <input
                        type="text"
                        name="accountNumber"
                        value={paymentInfo.accountNumber}
                        onChange={(e) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              accountNumber: e.target.value,
                            })
                        }
                        placeholder="0123456789"
                    />
                  </label>
                  <p className="eft-info">
                    After clicking “Place Order”, please transfer the amount to our
                    account:
                    <br />
                    <strong>Account: 123456789 | Bank: FNB | Branch Code: 250655</strong>
                  </p>
                </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <p>
            <strong>Order Number:</strong> {orderNumber}
          </p>
          <hr />
          <p>Subtotal: R{subtotal.toFixed(2)}</p>
          <p>Delivery Fee: R{deliveryFee}</p>
          <p>VAT (15%): R{vat.toFixed(2)}</p>
          <p>
            <strong>Grand Total: R{grandTotal.toFixed(2)}</strong>
          </p>
          <button onClick={handlePlaceOrder} className="place-order-btn">
            Place Order
          </button>
        </div>

        {/* Styles */}
        <style>{`
        .payment-page { display: flex; gap: 30px; padding: 30px; font-family: sans-serif; background: #f5f5f5; }
        .main-content { flex: 2; }
        .section { background: #f1ededff; padding: 20px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .section h3 { margin-bottom: 15px; }
        label { display: block; margin-bottom: 10px; font-weight: 500; }
        input, select { width: 100%; padding: 8px; margin-top: 5px; border-radius: 5px; border: 1px solid #ccc; }
        .shipping-title { font-size: 14px; font-weight: 600; margin-top: 10px; margin-bottom: 5px; color: #333; }
        .shipping-info { font-size: 12px; font-family: 'Comic Sans MS', 'Arial', sans-serif; color: #555; }
        .payment-method { display: flex; gap: 20px; margin-bottom: 15px; }
        .order-items { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 15px; }
        .order-item { display: flex; flex-direction: column; align-items: center; }
        .order-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 5px; }
        .order-summary { flex: 1; position: sticky; top: 30px; background: #f1ededff; padding: 20px; border-radius: 10px; height: fit-content; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .order-summary p { font-family: 'Comic Sans MS', 'Arial', sans-serif; font-size: 14px; margin: 5px 0; }
        .order-summary strong { font-weight: 600; }
        .eft-info { font-size: 14px; color: #555; margin-top: 10px; }
        .place-order-btn { background: #ffd600; color: #fff; padding: 10px 20px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.3s; width: 100%; }
        .place-order-btn:hover { background: #ffb300; }
      `}</style>
      </div>
  );
}