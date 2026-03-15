import { AuthUser } from "@/api/auth.api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart(state) {
      state.loading = true;
      state.error = null;
    },

    authSuccess(state, action: PayloadAction<AuthState["user"]>) {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },

    authFailure(state, action: PayloadAction<string>) {
      state.user = null;
      state.loading = false;
      state.error = action.payload;
    },

    logout: () => initialState,
  },
});

export const { authStart, authSuccess, authFailure, logout } =
  authSlice.actions;

export default authSlice.reducer;
