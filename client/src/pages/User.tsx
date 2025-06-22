import { useParams } from "react-router-dom";
import { useEffect } from "react";

function User() {
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        document.title = "Kontacts - User " + id;
    }, []);

    return (
        <div>
            <h1>User pagina</h1>
            <p>Gevonden user ID: {id}</p>
        </div>
    );
}

export default User;