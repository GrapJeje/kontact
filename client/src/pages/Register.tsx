import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.tsx";
import './Auth.scss';

function Register() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Kontact - Register";
    }, []);

    const [form, setForm] = useState({
        username: "",
        password: "",
        second_password: "",
    });

    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await fetch("http://localhost:3001/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: form.username,
                    password: form.password,
                    second_password: form.second_password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registratie mislukt");
            }

            setMessage("Registratie succesvol! Je kunt nu inloggen.");
            setForm({ username: "", password: "", second_password: "" });

            setTimeout(() => navigate("/login"), 2000);

        } catch (err) {
            setMessage(err.message || "Er is een fout opgetreden bij de registratie");
            console.error("Registratie fout:", err);
        }
    }

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="auth-page">
            <Header
                renderButtons={() => (
                    <>
                        <button onClick={() => navigate('/login')} className="action-btn" title="Login">
                            <p>Al een account? <span>Log dan nu in!</span></p>
                        </button>
                        <button onClick={() => window.open('https://github.com/GrapJeje/kontact', '_blank')}
                                className="github-btn" title="Zie Source">
                            <img src="/person.svg" alt="GitHub"/>
                        </button>
                    </>
                )}>
            </Header>

            <main className="auth-container">
                <div className="auth-card">
                    <div className="card-header">
                        <h1 className="auth-title">Account aanmaken</h1>
                        <div className="decoration-circle"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
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

                        <div className="form-group floating">
                            <input
                                type="password"
                                name="second_password"
                                id="second_password"
                                value={form.second_password}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                                className="form-input"
                                placeholder=" "
                            />
                            <label htmlFor="second_password" className="form-label">Bevestig wachtwoord</label>
                            <div className="underline"></div>
                        </div>

                        <button type="submit" className="submit-btn">
                            <span>Registreren</span>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"
                                      strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </form>

                    {message &&
                        <p className={`message ${message.includes('error') || message.includes('fout') ? 'error' : 'success'}`}>{message}</p>}
                </div>
            </main>
        </div>
    );
}

export default Register;