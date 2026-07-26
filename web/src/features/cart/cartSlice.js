import { createSlice } from "@reduxjs/toolkit";

const savedCart = localStorage.getItem("digipandit_cart");

const persistCart = (items) => {
  localStorage.setItem("digipandit_cart", JSON.stringify(items));
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: savedCart ? JSON.parse(savedCart) : [],
  },
  reducers: {
    addToCart(state, action) {
      const existing = state.items.find((item) => item._id === action.payload._id);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }

      persistCart(state.items);
    },
    updateQuantity(state, action) {
      const item = state.items.find((entry) => entry._id === action.payload.id);
      if (item) {
        item.quantity = Math.max(action.payload.quantity, 1);
      }
      persistCart(state.items);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item._id !== action.payload);
      persistCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      persistCart(state.items);
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
