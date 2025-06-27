import {useNavigate, useParams} from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header.tsx";

function User() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Kontact - User " + id;
    }, [id]);

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