import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type CartItem = { productId: string; vendorId?: string; name: string; price: number; quantity: number };

interface CartState { items: CartItem[] }

const initialState: CartState = { items: [] };

const slice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(i => i.productId === action.payload.productId);
      if (existing) existing.quantity += action.payload.quantity;
      else state.items.push(action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find(i => i.productId === action.payload.productId);
      if (item) {
        const q = Math.max(1, action.payload.quantity || 1);
        item.quantity = q;
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.productId !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  }
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = slice.actions;
export default slice.reducer;
