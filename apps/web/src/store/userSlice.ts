import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UserInfo = { _id: string; email: string; role: 'customer' | 'vendor' | 'admin'; vendorId?: string; profile?: Record<string, any> };
interface AuthState { token: string | null; user: UserInfo | null }

const initialState: AuthState = { token: null, user: null };

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ token: string; user: UserInfo }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout: (state) => { state.token = null; state.user = null; }
  }
});

export const { setUser, logout } = slice.actions;
export default slice.reducer;
