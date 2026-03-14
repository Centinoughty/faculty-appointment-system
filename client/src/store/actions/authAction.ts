import { api } from "@/api/axios";
import { AppDispatch } from "..";
import { loginFailure, loginStart, loginSuccess } from "../slices/authSlice";

export const login =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(loginStart());

      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      dispatch(
        loginSuccess({ user: data.user, accessToken: data.accessToken }),
      );

      return { success: true };
    } catch (error) {
      dispatch(loginFailure("Login Failed"));
      console.log(error);
    }
  };
