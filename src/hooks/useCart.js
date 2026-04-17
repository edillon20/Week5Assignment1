import { useEffect, useState } from "react";

export function useCart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");

    if (!savedCart) return;

    try {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
    } catch {
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    if (!item) {
      return { success: false, message: "Invalid item." };
    }

    const normalizedItem = {
      id: item.id,
      name: item.service ?? item.name ?? "Untitled Item",
      description:
        item.serviceInfo ?? item.description ?? "No description available.",
      price: Number(item.price) || 0,
      image: item.img ?? item.image ?? "",
      quantity: Number(item.quantity) || 1,
      type: item.type ?? "product",
    };

    const existingItem = cartItems.find(
      (cartItem) => cartItem.id === normalizedItem.id
    );

    const hasSubscriptionInCart = cartItems.some(
      (cartItem) => cartItem.type === "subscription"
    );

    if (
      normalizedItem.type === "subscription" &&
      hasSubscriptionInCart &&
      !existingItem
    ) {
      return {
        success: false,
        message: "You can only have one subscription in the cart at a time.",
      };
    }

    if (existingItem) {
      if (normalizedItem.type === "subscription") {
        return {
          success: false,
          message: "You can only have one of the same subscription in the cart.",
        };
      }

      setCartItems((prevItems) =>
        prevItems.map((cartItem) =>
          cartItem.id === normalizedItem.id
            ? {
                ...cartItem,
                quantity: Number(cartItem.quantity) + 1,
              }
            : cartItem
        )
      );

      return { success: true };
    }

    setCartItems((prevItems) => [...prevItems, normalizedItem]);
    return { success: true };
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateCartQuantity = (id, newQuantity) => {
    const qty = Number(newQuantity);

    if (qty < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        if (item.type === "subscription") {
          return { ...item, quantity: 1 };
        }

        return { ...item, quantity: qty };
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  };
}