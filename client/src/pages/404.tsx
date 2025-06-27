import {useNavigate} from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header.tsx";

function NotFound() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Kontact - 404 not found";
    }, []);

    return (
        <div>
            <Header
                renderButtons={({}) => (
                    <>
                        <button onClick={() => navigate('/')} className="backToSafety-btn">
                            Terug naar veiligheid!
                        </button>
                        <button onClick={() => window.open('https://github.com/GrapJeje/kontact', '_blank')}
                                className="login-btn" title="Zie Source">
                            <img src="/person.svg" alt="Person"/>
                        </button>
                    </>
                )}>
            </Header>
            <div className={"not-found"}>
                <div className="circle-container">
                    <img src="/notFound.gif" alt="Page not found"/>
                </div>
            </div>
        </div>
    );
}

export default NotFound;