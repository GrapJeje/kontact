import React from "react";
import { Navigate } from 'react-router-dom';
import useAuth from "../hooks/useAuth";

interface ProtectedRouteProps {
    children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) return <Navigate to="/login" replace={true} />;
    return children;
};

export default ProtectedRoute;