import React from "react";

function Orders({ orders = [] }) {
  const safeOrders = Array.isArray(orders) ? orders : [];

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="card orders-page">
      <div className="orders-header">
        <div>
          <h2>Order History</h2>
          <p>Review your past purchases below.</p>
        </div>
      </div>

      {safeOrders.length === 0 ? (
        <div className="empty-orders">
          <h3>No orders yet 📦</h3>
          <p>Your completed purchases will appear here.</p>
        </div>
      ) : (
        <div className="orders-list">
          {safeOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">
                    Placed: {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="order-total-badge">
                  Total: ${Number(order.total || 0).toFixed(2)}
                </div>
              </div>

              <div className="order-customer">
                <p>
                  <strong>Name:</strong> {order.customer?.fullName || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {order.customer?.email || "N/A"}
                </p>
              </div>

              <div className="order-items">
                {Array.isArray(order.items) &&
                  order.items.map((item) => (
                    <div key={`${order.id}-${item.id}`} className="order-item-row">
                      <div>
                        <strong>{item.name}</strong>
                        <p>Qty: {item.quantity}</p>
                      </div>

                      <span>
                        $
                        {(
                          Number(item.price || 0) * Number(item.quantity || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="order-totals">
                <div className="order-total-row">
                  <span>Subtotal</span>
                  <strong>${Number(order.subtotal || 0).toFixed(2)}</strong>
                </div>

                <div className="order-total-row">
                  <span>Tax</span>
                  <strong>${Number(order.tax || 0).toFixed(2)}</strong>
                </div>

                <div className="order-total-row order-grand-total">
                  <span>Total</span>
                  <strong>${Number(order.total || 0).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;