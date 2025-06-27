import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.tsx";

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
        <div>
            <Header
                renderButtons={() => (
                    <>
                        <button onClick={() => navigate('/login')} className="login-btn" title="Login">
                            <p>Al een account? Log dan nu in!</p>
                        </button>
                        <button onClick={() => window.open('https://github.com/GrapJeje/kontact', '_blank')}
                                className="login-btn" title="Zie Source">
                            <img src="/person.svg" alt="Person"/>
                        </button>
                    </>
                )}>
            </Header>

            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <div>
                <label>Username:<br />
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

                <div>
                    <label>Confirm Password:<br />
                        <input
                            type="password"
                            name="second_password"
                            value={form.second_password}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                        />
                    </label>
                </div>

                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default Register;