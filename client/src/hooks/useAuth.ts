import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    userId: string;
    username: string;
    exp: number;
}

function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<{id: string, username: string} | null>(null);

    const validateToken = async (token: string): Promise<boolean> => {
        try {
            const decoded: DecodedToken = jwtDecode(token);

            if (decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem("authToken");
                return false;
            }

            const response = await fetch("http://localhost:3001/api/validate-token", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                localStorage.removeItem("authToken");
                return false;
            }

            setUser({
                id: decoded.userId,
                username: decoded.username
            });

            return true;
        } catch (error) {
            console.error("Token validatie error:", error);
            localStorage.removeItem("authToken");
            return false;
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("authToken");

            if (!token) {
                setIsLoggedIn(false);
                setIsLoading(false);
                return;
            }

            const isValid = await validateToken(token);
            setIsLoggedIn(isValid);
            setIsLoading(false);
        };

        checkAuth();

        const handleStorageChange = () => {
            checkAuth();
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return { isLoggedIn, isLoading, user };
}

export default useAuth;