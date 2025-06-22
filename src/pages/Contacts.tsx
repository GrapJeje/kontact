import { useEffect } from "react";

function Contacts() {
    useEffect(() => {
        document.title = "Kontacts";
    }, []);

  return (
    <div>
      <h1>Contacts</h1>
      <p>This is the Contacts page.</p>
    </div>
  );
}

export default Contacts;