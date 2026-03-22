"use client";

import { loginAction, logoutAction } from "@/src/store/actions/authAction";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { ChangeEvent, SyntheticEvent, useState } from "react";

export default function useAuth() {
    const dispatch = useAppDispatch();
    const { isLoading, error , isAuthenticated} = useAppSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const result = await loginAction(formData)(dispatch);

        if (result?.success) {
            console.log("Login successful");
        }

        setFormData({
            email: "",
            password: "",
        });
    };

    return {
        formData,
        handleChange,
        handleLogin,

        isLoading,
        error,
        isAuthenticated
    };
}
