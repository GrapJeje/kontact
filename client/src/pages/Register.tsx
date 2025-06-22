import { useEffect } from "react";

function Register() {
    useEffect(() => {
        document.title = "Kontacts - Register";
    }, []);

    return (
        <div>
            <h1>Register</h1>
            <p>This is the Register page.</p>
        </div>
    );
}

export default Register;