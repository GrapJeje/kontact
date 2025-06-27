import React from "react";
import { Navigate } from 'react-router-dom';
import useAuth from "../hooks/useAuth";

interface PublicRouteProps {
    children: React.ReactElement;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    if (isLoggedIn) return <Navigate to="/" replace={true} />;

    return children;
};

export default PublicRoute;