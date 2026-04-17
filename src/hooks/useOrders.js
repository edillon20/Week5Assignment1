import { useEffect, useState } from "react";

export function useOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem("orders");

    if (!savedOrders) return;

    try {
      const parsedOrders = JSON.parse(savedOrders);
      setOrders(Array.isArray(parsedOrders) ? parsedOrders : []);
    } catch {
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order) => {
    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      return { success: false, message: "Invalid order." };
    }

    setOrders((prevOrders) => [order, ...prevOrders]);
    return { success: true };
  };

  const clearOrders = () => {
    setOrders([]);
  };

  return {
    orders,
    addOrder,
    clearOrders,
  };
}