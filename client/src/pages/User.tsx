import {useNavigate, useParams} from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header.tsx";
import useAuth from "../hooks/useAuth.ts";

function User() {
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Kontact - User " + id;

        const verifyUser = async () => {
            if (!user?.id) return;

            try {
                const res = await fetch("http://localhost:3001/api/contacts/verifyperson", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({contact_id: id ,user_id: user.id}),
                    credentials: "include"
                });

                if (!res.ok) navigate('/');

                const data = await res.json();
                if (!data.valid) navigate('/');
            } catch (error) {
                console.error("Fout bij het verkrijgen van alle contacten: ", error);
            }
        }

        verifyUser();
    }, [user?.id, id, navigate]);

    return (
        <div>
            <Header
                renderButtons={({handleLogout}) => (
                    <>
                        <button onClick={() => navigate('/')} className="logout-btn" title="Terug naar overzicht">
                            <img src="/contacts/back-icon.svg" alt="Back" width="24" height="24"/>
                        </button>
                        <button onClick={handleLogout} className="logout-btn" title="Uitloggen">
                            <img src="/contacts/logout-icon.svg" alt="Logout" width="24" height="24"/>
                        </button>
                    </>
                )}>
            </Header>
            <h1>User pagina</h1>
            <p>Gevonden user ID: {id}</p>
        </div>
    );
}

export default User;