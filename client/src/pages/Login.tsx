import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.tsx";
import './Auth.scss';

function Login() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Kontact - Login";
    }, []);

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        try {
            const res = await fetch("http://localhost:3001/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include"
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                setMessage(errorData?.message || "Inloggen mislukt.");
                return;
            }

            const data = await res.json();
            const userId = data?.user?.id;
            const token = data?.token;

            if (!userId || !token) {
                setMessage("Authenticatiegegevens ontbreken.");
                return;
            }

            localStorage.setItem("authToken", token);

            setMessage("Login succesvol!");
            setForm({ username: "", password: "" });
            navigate("/");

        } catch (error) {
            console.error("Fout bij het inloggen:", error);
            setMessage("Er is iets misgegaan tijdens het inloggen.");
        }
    };

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="login-page">
            <Header
                renderButtons={() => (
                    <>
                        <button onClick={() => navigate('/register')} className="register-btn" title="Aanmelden">
                            <p>Geen account? <span>Meld je aan!</span></p>
                        </button>
                        <button onClick={() => window.open('https://github.com/GrapJeje/kontact', '_blank')}
                                className="github-btn" title="Zie Source">
                            <img src="/person.svg" alt="GitHub"/>
                        </button>
                    </>
                )}>
            </Header>

            <main className="login-container">
                <div className="login-card">
                    <div className="card-header">
                        <h1 className="login-title">Welkom terug!</h1>
                        <div className="decoration-circle"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group floating">
                            <input
                                type="text"
                                name="username"
                                id="username"
                                value={form.username}
                                onChange={handleChange}
                                required
                                autoComplete="username"
                                className="form-input"
                                placeholder=" "
                            />
                            <label htmlFor="username" className="form-label">Gebruikersnaam</label>
                            <div className="underline"></div>
                        </div>

                        <div className="form-group floating">
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                                className="form-input"
                                placeholder=" "
                            />
                            <label htmlFor="password" className="form-label">Wachtwoord</label>
                            <div className="underline"></div>
                        </div>

                        <button type="submit" className="submit-btn">
                            <span>Inloggen</span>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"
                                      strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </form>

                    {message &&
                        <p className={`message ${message.includes('error') ? 'error' : 'success'}`}>{message}</p>}
                </div>
            </main>
        </div>
    );
}

export default Login;