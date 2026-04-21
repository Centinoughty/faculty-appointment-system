"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { verifySessionAction } from "../store/actions/authAction";
import { AppDispatch, RootState } from "../store";
import SkeletonLoader from "./analytics/SkeletonLoader";
import useAuth from '@/src/hooks/useAuth';

const publicRoutes = ['/login'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const isInitializing = useSelector((state: RootState) => state.auth.isInitializing);
    const dispatch = useDispatch<AppDispatch>();
    const hasChecked = useRef(false);

    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading, user } = useAuth();

    useEffect(() => {
        if (!hasChecked.current) {
            dispatch(verifySessionAction());
            hasChecked.current = true;
        }
    }, [dispatch]);

    useEffect(() => {
        if (!isInitializing && !isLoading) {
            const isPublicRoute = publicRoutes.includes(pathname);
            const isAdmin = user?.role === 'admin';

            if (!isAuthenticated && !isPublicRoute) {
                router.push('/login');
            } else if (isAuthenticated) {
                if (!isAdmin && !isPublicRoute) {
                    // Logged in but not an admin - kick to login
                    router.push('/login');
                } else if (isAdmin && isPublicRoute) {
                    router.push('/analytics');
                }
            }
        }
    }, [isInitializing, isLoading, isAuthenticated, pathname, router, user]);

    const isPublicRoute = publicRoutes.includes(pathname);
    if (isInitializing || (isLoading && !isPublicRoute)) {
        return <SkeletonLoader />;
    }
    if (!isAuthenticated && !isPublicRoute) {
        return null;
    }

    return <>{children}</>;
}