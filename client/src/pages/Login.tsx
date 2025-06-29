import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.tsx";

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
        <div>
            <Header
                renderButtons={() => (
                    <>
                        <button onClick={() => navigate('/register')} className="register-btn" title="Aanmelden">
                            <p>Geen account? Meld je dan nu aan!</p>
                        </button>
                        <button onClick={() => window.open('https://github.com/GrapJeje/kontact', '_blank')}
                                className="login-btn" title="Zie Source">
                            <img src="/person.svg" alt="Person"/>
                        </button>
                    </>
                )}>
            </Header>

            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:<br/>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                        />
                    </label>
                </div>

                <div>
                    <label>Password:<br />
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                        />
                    </label>
                </div>

                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default Login;