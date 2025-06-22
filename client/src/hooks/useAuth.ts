import { useState, useEffect } from "react";

function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        setIsLoggedIn(!!token);
    }, []);

    return isLoggedIn;
}

export default useAuth;