import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

interface DecodedToken {
    userId: string;
    username: string;
    exp: number;
}

function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<{id: string, username: string} | null>(null);
    const navigate = useNavigate();

    const validateToken = async (token: string): Promise<boolean> => {
        try {
            // Eerst JWT verifiëren
            const decoded = jwtDecode(token) as DecodedToken;
            if (Date.now() >= decoded.exp * 1000) {
                return false;
            }

            // Dan server-side validatie
            const response = await fetch("http://localhost:3001/api/validate-token", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                localStorage.removeItem("authToken");
                return false;
            }

            const data = await response.json();
            return data.valid;
        } catch (error) {
            console.error("Token validatie error:", error);
            return false;
        }
    };

    const logout = async () => {
        const token = localStorage.getItem("authToken");

        // Verwijder token onmiddellijk uit localStorage
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
        setUser(null);

        try {
            if (token) {
                await fetch("http://localhost:3001/api/logout", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            navigate("/login");
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

            try {
                const isValid = await validateToken(token);
                setIsLoggedIn(isValid);

                if (isValid) {
                    const decoded: DecodedToken = jwtDecode(token);
                    setUser({
                        id: decoded.userId,
                        username: decoded.username
                    });
                } else {
                    localStorage.removeItem("authToken");
                }
            } catch (error) {
                console.error("Auth check error:", error);
                localStorage.removeItem("authToken");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    return { isLoggedIn, isLoading, user, logout };
}

export default useAuth;