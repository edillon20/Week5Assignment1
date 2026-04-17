import React, { useState } from "react";
import list from "../data";
import "../Subscription.css";
import Toast from "../components/Toast";

function Subscriptions({ addToCart }) {
  const [toast, setToast] = useState({ message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast({ message: "", type: "success" });
  };

  const handleAddToCart = (item) => {
    const isSubscription =
      item.service === "Basic Subscription" ||
      item.service === "Gold Subscription" ||
      item.service === "Premium Subscription" ||
      item.service === "Social Media Sharing Subscription";

    const result = addToCart({
      ...item,
      quantity: 1,
      type: isSubscription ? "subscription" : "product",
    });

    if (!result.success) {
      showToast(result.message, "error");
      return;
    }

    showToast(`${item.service} added to cart.`);
  };

  return (
    <div className="card">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      <h2>Available Subscriptions</h2>
      <p>Select a plan or product to add to your cart.</p>

      <div className="subscription-grid">
        {list.map((item) => (
          <div key={item.id} className="subscription-card">
            <img
              src={item.img}
              alt={item.service}
              style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }}
            />

            <h3>{item.service}</h3>
            <p>{item.serviceInfo}</p>
            <p><strong>${item.price.toFixed(2)}</strong></p>

            <button
              type="button"
              className="btn-primary"
              onClick={() => handleAddToCart(item)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Subscriptions;