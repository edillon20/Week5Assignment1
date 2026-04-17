import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import { useOfflineStatus } from "../hooks/useOfflineStatus";

function Cart({ cartItems, removeFromCart, updateCartQuantity }) {
  const navigate = useNavigate();
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const [toast, setToast] = useState({ message: "", type: "success" });
  const isOffline = useOfflineStatus();
  const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false);
  const [dialog, setDialog] = useState({
    isOpen: false,
    id: null,
    name: "",
  });

  useEffect(() => {
    if (isOffline && !hasShownOfflineToast) {
      showToast("You are offline. Checkout is unavailable.", "error");
      setHasShownOfflineToast(true);
    }

    if (!isOffline && hasShownOfflineToast) {
      showToast("You are back online.");
      setHasShownOfflineToast(false);
    }
  }, [isOffline, hasShownOfflineToast]);

  const totalItems = safeCartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const totalPrice = safeCartItems.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast({ message: "", type: "success" });
  };

  const handleRemoveRequest = (item) => {
    setDialog({
      isOpen: true,
      id: item.id,
      name: item.name,
    });
  };

  const confirmRemove = () => {
    removeFromCart(dialog.id);
    showToast(`"${dialog.name}" removed from cart.`);
    setDialog({ isOpen: false, id: null, name: "" });
  };

  const cancelRemove = () => {
    setDialog({ isOpen: false, id: null, name: "" });
  };

  return (
    <div className="card cart-page">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      <ConfirmDialog
        isOpen={dialog.isOpen}
        title="Remove item?"
        message={`Remove "${dialog.name}" from your cart?`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />

      <div className="cart-header">
        <div>
          <h2>Your Cart</h2>
          <p>Review your selected items below.</p>
        </div>
      </div>

      {isOffline && (
        <p className="offline-message">
          You must be online to continue to checkout.
        </p>
      )}

      {safeCartItems.length === 0 ? (
        <div className="empty-cart">
          <h3>Your cart is empty 🛒</h3>
          <p>Add a subscription, movie, or product to get started.</p>

          <div className="empty-cart-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/subscriptions")}
            >
              Browse Subscriptions
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/movies")}
            >
              Browse Movies
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="cart-summary">
            <div className="cart-summary-item">
              <span>Unique Items</span>
              <strong>{safeCartItems.length}</strong>
            </div>

            <div className="cart-summary-item">
              <span>Total Quantity</span>
              <strong>{totalItems}</strong>
            </div>

            <div className="cart-summary-item cart-summary-total">
              <span>Total</span>
              <strong>${totalPrice.toFixed(2)}</strong>
            </div>
          </div>

          <div className="cart-list">
            {safeCartItems.map((item) => {
              const quantity = Number(item.quantity);
              const price = Number(item.price);
              const subtotal = price * quantity;
              const isSubscription = item.type === "subscription";

              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-info">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-image"
                    />

                    <div className="cart-text">
                      <div className="cart-title-row">
                        <h3>{item.name}</h3>
                        {isSubscription && (
                          <span className="subscription-badge">
                            Subscription
                          </span>
                        )}
                      </div>

                      <p className="cart-description">{item.description}</p>
                      <p className="cart-price">Price: ${price.toFixed(2)}</p>
                      <p className="cart-subtotal">
                        Subtotal: ${subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="cart-actions">
                    {isSubscription ? (
                      <div className="cart-quantity-fixed">Qty: 1</div>
                    ) : (
                      <div className="quantity-controls">
                        <button
                          type="button"
                          className="btn-secondary quantity-btn"
                          disabled={quantity <= 1}
                          onClick={() =>
                            updateCartQuantity(item.id, quantity - 1)
                          }
                        >
                          −
                        </button>

                        <span className="quantity-value">{quantity}</span>

                        <button
                          type="button"
                          className="btn-secondary quantity-btn"
                          onClick={() =>
                            updateCartQuantity(item.id, quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleRemoveRequest(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-footer">
            <h3>Total: ${totalPrice.toFixed(2)}</h3>

            <button
              type="button"
              className="btn-primary"
              disabled={isOffline}
              onClick={() => {
                if (isOffline) return;
                navigate("/checkout");
              }}
            >
              {isOffline ? "Checkout unavailable offline" : "Checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;