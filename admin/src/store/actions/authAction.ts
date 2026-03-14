import { AppDispatch } from "..";
import { api } from "@/src/api/axios";
import { loginFailure, loginStart, loginSuccess, logout } from "../slices/authSlice";

interface LoginCredentials {
    email: string;
    password: string;
}

export const loginAction = (credentials: LoginCredentials) => async (dispatch: AppDispatch) => {
    try {
        dispatch(loginStart());

        const { data } = await api.post("/auth/login", credentials);

        dispatch(
            loginSuccess({ user: data.user, accessToken: data.accessToken }),
        )

        return { success: true };
    } catch (error) {
        dispatch(loginFailure("Login Failed"));
        console.log(error);
    }
};

export const logoutAction = () => (dispatch: AppDispatch) => {
    dispatch(logout());
};



