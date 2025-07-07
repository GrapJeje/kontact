import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header.tsx";
import notFoundGif from "/notFound.gif";
import personIcon from "/person.svg";

function NotFound() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Kontact - 404 not found";
    }, []);

    const handleBackToSafety = () => navigate('/');
    const handleOpenGithub = () => window.open('https://github.com/GrapJeje/kontact', '_blank');

    return (
        <div className="not-found-page">
            <Header
                renderButtons={() => (
                    <>
                        <button
                            onClick={handleBackToSafety}
                            className="backToSafety-btn"
                            aria-label="Terug naar home pagina"
                        >
                            Terug naar veiligheid!
                        </button>
                        <button
                            onClick={handleOpenGithub}
                            className="login-btn"
                            title="Zie Source"
                            aria-label="Bekijk source code op GitHub"
                        >
                            <img src={personIcon} alt="GitHub link" width={24} height={24} />
                        </button>
                    </>
                )}
            />

            <main className="not-found-container">
                <div className="circle-container">
                    <img
                        src={notFoundGif}
                        alt="404 Pagina niet gevonden"
                        loading="lazy"
                        width={280}
                        height={280}
                    />
                </div>
            </main>
        </div>
    );
}

export default NotFound;