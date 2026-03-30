import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (product) => {
    setItems((current) => {
      const existing = current.find((item) => item._id === product._id);

      if (existing) {
        return current.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((current) => current.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (!Number.isFinite(quantity) || quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item._id === productId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const summary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 999 ? 0 : items.length ? 79 : 0;

    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      summary,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [items, summary]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
