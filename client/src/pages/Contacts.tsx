import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ContactBanner from "../components/ContactBanner.tsx";
import type {Contact} from "../models/Contact.ts";
import "./Contacts.scss";

function Contacts() {
    const { user, logout } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [animating, setAnimating] = useState(false);
    const navigate = useNavigate();

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
                setFilteredContacts(data);
            } catch (error) {
                console.error("Fout bij het verkrijgen van alle contacten: ", error);
                setError("Failed to load contacts");
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, [user?.id]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredContacts(contacts);
        } else {
            const filtered = contacts.filter(contact =>
                contact.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredContacts(filtered);
        }
    }, [searchTerm, contacts]);

    const toggleSearching = () => {
        if (animating) return;

        setAnimating(true);
        if (!searching) {
            setSearching(true);
            setTimeout(() => setAnimating(false), 300);
        } else {
            setSearching(false);
            setTimeout(() => {
                setSearchTerm("");
                setAnimating(false);
            }, 250);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate(`/login`);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="contacts-wrapper">
            <div className="contacts-scroll-wrapper">
                <div className="contacts">
                    <div className="contacts-header">
                        <div className={"contacts-header-wrapper"}>
                            <div className={"contacts-header-name"}>
                                <h1 className={"contacts-header-name-kop"}>Kontacts</h1>
                                <p className={"contacts-header-name-small"}>Beheer al jouw contacten op één plek!</p>
                            </div>
                            <div className={`contacts-header-btn ${searching ? 'searching searching-active' : ''} ${animating ? (searching ? 'searching-active' : 'searching-inactive') : ''}`}>
                                <input
                                    type="text"
                                    placeholder="Zoek contacten..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    style={{display: searching ? 'block' : 'none'}}
                                />
                                <button onClick={toggleSearching} title={"Zoek contacten"}>
                                    <img
                                        src={"/contacts/magnifying-glass.svg"}
                                        alt={"Search"}
                                        width="24"
                                        height="24"
                                    />
                                </button>
                                {!searching && (
                                    <button onClick={() => navigate('/new')} title={"Nieuw contact"}>
                                        <img src="/contacts/plus-icon.svg" alt="Add" width="24" height="24"/>
                                    </button>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="logout-btn"
                                    title="Uitloggen"
                                >
                                    <img src="/contacts/logout-icon.svg" alt="Logout" width="24" height="24"/>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="contacts-body">
                        {loading && <p>Loading contacts...</p>}
                        {error && <p className="error">{error}</p>}

                        <div className="contacts-content">
                            {filteredContacts.length > 0 ? (
                                filteredContacts.map(contact => (
                                    <ContactBanner key={contact.id} {...contact} />
                                ))
                            ) : (
                                !loading && <p>{searchTerm ? "Geen contacten gevonden" : "No contacts found"}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contacts;