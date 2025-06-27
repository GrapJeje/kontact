import {useEffect} from "react";
import Header from "../components/Header.tsx";
import {useNavigate} from "react-router-dom";

function New() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Kontact - Nieuw Contact";
    }, []);

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
            <h1>New</h1>
        </div>
    );
}

export default New;