import {useEffect, useState} from "react";
import useAuth from "../hooks/useAuth";
import ContactBanner from "../components/ContactBanner.tsx";
import type {Contact} from "../models/Contact.ts";
import "./Contacts.scss";

function Contacts() {
    const {user} = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searching = false;

    useEffect(() => {
        document.title = "Kontacts";

        const fetchContacts = async () => {
            if (!user?.id) return;

            try {
                const res = await fetch("http://localhost:3001/api/contacts/all", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({id: user.id}),
                    credentials: "include"
                });

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

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
        <div className="contacts-wrapper">
            <div className="contacts-scroll-wrapper">
                <div className="contacts">
                    <div className="contacts-header">
                        <div className={"contacts-header-name"}>
                            <h1 className={"contacts-header-name-kop"}>Kontacts</h1>
                            <p className={"contacts-header-name-small"}>Beheer al jouw contacten op één plek!</p>
                        </div>
                        <div className={"contacts-header-btn"}>
                            {searching && (
                                <input type="text"/>
                            )}
                            <button>
                                <img src="/contacts/magnifying-glass.svg" alt="Add" width="24" height="24"/>
                            </button>
                            {!searching && (
                                <button>
                                    <img src="/contacts/plus-icon.svg" alt="Add" width="24" height="24" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="contacts-body">
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
                </div>
            </div>
        </div>
    );
}

export default Contacts;