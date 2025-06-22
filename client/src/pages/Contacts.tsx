import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import ContactBanner from "../components/ContactBanner.tsx";
import type { Contact } from "../models/Contact.ts";

function Contacts() {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = "Kontacts";

        const fetchContacts = async () => {
            if (!user?.id) return;

            try {
                const res = await fetch("http://localhost:3001/api/contacts/all", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: user.id }),
                    credentials: "include"
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                setContacts(data);
            } catch (error) {
                console.error("Fout bij het verkrijgen van alle contacten: ", error);
                setError("Failed to load contacts");
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, [user?.id]);

    return (
        <div>
            <h1>Contacts</h1>
            <div className="user-info">
                <h2>Welkom, {user?.username}!</h2>
                <p>Jouw gebruikers-ID: {user?.id}</p>
            </div>

            {loading && <p>Loading contacts...</p>}
            {error && <p className="error">{error}</p>}

            <div className="contacts-content">
                {contacts.length > 0 ? (
                    contacts.map(contact => (
                        <ContactBanner key={contact.id} {...contact} />
                    ))
                ) : (
                    !loading && <p>No contacts found</p>
                )}
            </div>
        </div>
    );
}

export default Contacts;