import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User { }

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },

    loginSuccess(
      state,
      action: PayloadAction<{ user: User; }>,
    ) {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isInitializing = false;
      state.user = action.payload.user;
      state.error = null;
    },

    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.isInitializing = false;
      state.error = action.payload;
    },

    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    finishInitialization(state) {
      state.isInitializing = false;
    }
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, finishInitialization } =
  authSlice.actions;
export default authSlice.reducer;
