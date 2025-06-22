import {useEffect, useState} from "react";

function Register() {
    useEffect(() => {
        document.title = "Kontacts - Register";
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
            const res = await fetch("http://localhost:3001/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const text = await res.text();
            if (res.ok) {
                setMessage("Registratie succesvol!");
                setForm({ username: "", password: "", second_password: "" });
            } else setMessage(text);
        } catch (err) {
            setMessage("Er is iets misgegaan.");
            console.error(err);
        }

    }

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div>
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