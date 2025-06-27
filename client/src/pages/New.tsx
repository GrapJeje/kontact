import {useEffect} from "react";

function New() {
    useEffect(() => {
        document.title = "Kontacts - Nieuw Contact";
    }, []);

    return (
        <div>
            <h1>New</h1>
        </div>
    );
}

export default New;