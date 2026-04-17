import { AppDispatch } from "..";
import { api } from "@/src/api/axios";
import { finishInitialization, loginFailure, loginStart, loginSuccess, logout } from "../slices/authSlice";

interface LoginCredentials {
    email: string;
    password: string;
}

export const loginAction = (credentials: LoginCredentials) => async (dispatch: AppDispatch) => {
    try {
        dispatch(loginStart());


        const { data } = await api.post("login", credentials, { withCredentials: true });

        dispatch(
            loginSuccess({ user: data }),
        )

        return { success: true };
    } catch (error) {
        dispatch(loginFailure("Login Failed"));
        console.log(error);
    }
};

export const verifySessionAction = () => async (dispatch: AppDispatch) => {
    try {
        dispatch(loginStart());

        const { data } = await api.get("auth/me", { withCredentials: true });

        dispatch(loginSuccess({ user: data }));

        return { success: true };
    } catch (error) {
        dispatch(loginFailure("Session expired or missing"));
        return { success: false };
    } finally {
        dispatch(finishInitialization());
    }
};

export const logoutAction = () => (dispatch: AppDispatch) => {
    dispatch(logout());
};



