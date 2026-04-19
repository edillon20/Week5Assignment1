import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { v4 as uuidv4 } from "uuid";

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiration(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function Checkout({ cartItems = [], clearCart, addOrder }) {
  const navigate = useNavigate();
  const isOffline = useOfflineStatus();

  const [toast, setToast] = useState({ message: "", type: "success" });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardName: "",
    cardNumber: "",
    expiration: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({});

  const safeCartItems = useMemo(() => {
    return Array.isArray(cartItems) ? cartItems : [];
  }, [cartItems]);

  const totals = useMemo(() => {
    const subtotal = safeCartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity || 0),
      0
    );

    const tax = subtotal * 0.065;
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
    };
  }, [safeCartItems]);

  useEffect(() => {
    const selectedCardRaw = localStorage.getItem("selectedCheckoutCard");

    if (selectedCardRaw) {
      try {
        const selectedCard = JSON.parse(selectedCardRaw);

        setFormData((prev) => ({
          ...prev,
          cardName: selectedCard.cardHolder || "",
          cardNumber: selectedCard.cardNumber || "",
          expiration: selectedCard.expiration || "",
          cvv: selectedCard.cvv || "",
        }));

        setToast({
          message: `Loaded saved card for ${selectedCard.cardHolder}.`,
          type: "success",
        });

        localStorage.removeItem("selectedCheckoutCard");
      } catch {
        localStorage.removeItem("selectedCheckoutCard");
      }
    }
  }, []);

  useEffect(() => {
    if (isOffline && !hasShownOfflineToast) {
      showToast("You are offline. Orders cannot be placed right now.", "error");
      setHasShownOfflineToast(true);
    }

    if (!isOffline && hasShownOfflineToast) {
      showToast("You are back online.");
      setHasShownOfflineToast(false);
    }
  }, [isOffline, hasShownOfflineToast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast({ message: "", type: "success" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "cardNumber"
          ? formatCardNumber(value)
          : name === "expiration"
          ? formatExpiration(value)
          : value,
    }));
  };

  const goChooseSavedCard = () => {
    navigate("/cards", {
      state: {
        returnTo: "/checkout",
      },
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required.";
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required.";
    }

    if (!formData.cardName.trim()) {
      newErrors.cardName = "Name on card is required.";
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required.";
    } else if (formData.cardNumber.replace(/\s/g, "").length < 12) {
      newErrors.cardNumber = "Enter a valid card number.";
    }

    if (!formData.expiration.trim()) {
      newErrors.expiration = "Expiration date is required.";
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = "CVV is required.";
    } else if (formData.cvv.length < 3) {
      newErrors.cvv = "Enter a valid CVV.";
    }

    if (safeCartItems.length === 0) {
      newErrors.cart = "Your cart is empty.";
    }

    if (isOffline) {
      newErrors.offline = "You must be online to place an order.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (isOffline) {
      showToast("You are offline. Orders cannot be placed right now.", "error");
      setErrors((prev) => ({
        ...prev,
        offline: "You must be online to place an order.",
      }));
      return;
    }

    if (!validateForm()) {
      showToast("Please fix the form errors before placing your order.", "error");
      return;
    }

    const orderId = uuidv4();

    const order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
      },
      shippingAddress: {
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
      },
      items: safeCartItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
    };

    if (typeof addOrder === "function") {
      const result = addOrder(order);

      if (!result.success) {
        showToast(result.message || "Could not save your order.", "error");
        return;
      }
    }

    if (typeof clearCart === "function") {
      clearCart();
    }

    setPlacedOrderId(orderId);
    setOrderPlaced(true);
    showToast("Order placed successfully.");
  };

  if (orderPlaced) {
    return (
      <div className="card checkout-page">
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />

        <h2>Order Confirmed</h2>
        <p>Your order has been placed successfully.</p>
        <p>
          <strong>Order ID:</strong> {placedOrderId}
        </p>

        <div className="checkout-success-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/orders")}
          >
            View Orders
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card checkout-page">
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />

      <h2>Checkout</h2>
      <p>Enter your billing and payment details below.</p>

      {isOffline && (
        <p className="offline-message">
          You must be online to place an order.
        </p>
      )}

      {errors.cart && <p className="checkout-error">{errors.cart}</p>}
      {errors.offline && <p className="checkout-error">{errors.offline}</p>}

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h3>Billing Details</h3>

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <p className="checkout-error">{errors.fullName}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="checkout-error">{errors.email}</p>}

          <input
            type="text"
            name="address"
            placeholder="Street Address"
            value={formData.address}
            onChange={handleChange}
          />
          {errors.address && <p className="checkout-error">{errors.address}</p>}

          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />
          {errors.city && <p className="checkout-error">{errors.city}</p>}

          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
          />
          {errors.state && <p className="checkout-error">{errors.state}</p>}

          <input
            type="text"
            name="zipCode"
            placeholder="ZIP Code"
            value={formData.zipCode}
            onChange={handleChange}
          />
          {errors.zipCode && <p className="checkout-error">{errors.zipCode}</p>}

          <h3>Payment Details</h3>

          <button
            type="button"
            className="btn-secondary"
            onClick={goChooseSavedCard}
            style={{ marginBottom: "12px" }}
          >
            Use A Saved Card
          </button>

          <input
            type="text"
            name="cardName"
            placeholder="Name on Card"
            value={formData.cardName}
            onChange={handleChange}
          />
          {errors.cardName && <p className="checkout-error">{errors.cardName}</p>}

          <input
            type="text"
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={formData.cardNumber}
            onChange={handleChange}
            maxLength={19}
          />
          {errors.cardNumber && (
            <p className="checkout-error">{errors.cardNumber}</p>
          )}

          <input
            type="text"
            name="expiration"
            placeholder="MM/YY"
            value={formData.expiration}
            onChange={handleChange}
            maxLength={5}
          />
          {errors.expiration && <p className="checkout-error">{errors.expiration}</p>}

          <input
            type="text"
            name="cvv"
            placeholder="CVV"
            value={formData.cvv}
            onChange={handleChange}
          />
          {errors.cvv && <p className="checkout-error">{errors.cvv}</p>}

          <button type="submit" className="btn-primary" disabled={isOffline}>
            {isOffline ? "Place Order unavailable offline" : "Place Order"}
          </button>
        </form>

        <div className="checkout-summary">
          <h3>Order Summary</h3>

          {safeCartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {safeCartItems.map((item) => (
                <div key={item.id} className="checkout-summary-item">
                  <div>
                    <strong>{item.name}</strong>
                    <p>Qty: {item.quantity}</p>
                  </div>

                  <span>
                    $
                    {(
                      Number(item.price) * Number(item.quantity || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="checkout-total-row">
                <span>Subtotal</span>
                <strong>${totals.subtotal.toFixed(2)}</strong>
              </div>

              <div className="checkout-total-row">
                <span>Tax</span>
                <strong>${totals.tax.toFixed(2)}</strong>
              </div>

              <div className="checkout-total-row checkout-grand-total">
                <span>Total</span>
                <strong>${totals.total.toFixed(2)}</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkout;