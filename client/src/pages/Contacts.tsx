import { useEffect } from "react";
import useAuth from "../hooks/useAuth";

function Contacts() {
    const { user } = useAuth();
    useEffect(() => {
        document.title = "Kontacts";
    }, []);

    return (
        <div>
            <h1>Contacts</h1>
            <div className="user-info">
                <h2>Welkom, {user?.username}!</h2>
                <p>Jouw gebruikers-ID: {user?.id}</p>
            </div>
            <div className="contacts-content">
                <p>Dit is je persoonlijke contactenpagina.</p>
            </div>
        </div>
    );
}

export default Contacts;