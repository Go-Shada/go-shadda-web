import { configureStore } from '@reduxjs/toolkit';
import cart from './cartSlice';
import user from './userSlice';

export const store = configureStore({
  reducer: { cart, user },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
