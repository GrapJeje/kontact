import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ContactBanner from "../components/ContactBanner.tsx";
import type {Contact} from "../models/Contact.ts";
import "./Contacts.scss";
import Header from "../components/Header.tsx";

function Contacts() {
    const {user} = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Kontact - Beheer al jouw contacten op één plek!";

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="contacts-wrapper">
            <div className="contacts-scroll-wrapper">
                <div className="contacts">
                    <Header
                        renderButtons={({searching, toggleSearching, handleLogout}) => (
                            <>
                                <input
                                    type="text"
                                    placeholder="Zoek contacten..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    style={{display: searching ? 'block' : 'none'}}
                                />
                                <button onClick={toggleSearching} title="Zoek contacten">
                                    <img src="/contacts/magnifying-glass.svg" alt="Search" width="24" height="24"/>
                                </button>
                                {!searching && (
                                    <button onClick={() => navigate('/new')} title="Nieuw contact">
                                        <img src="/contacts/plus-icon.svg" alt="Add" width="24" height="24"/>
                                    </button>
                                )}
                                <button onClick={handleLogout} className="logout-btn" title="Uitloggen">
                                    <img src="/contacts/logout-icon.svg" alt="Logout" width="24" height="24"/>
                                </button>
                            </>
                        )}>
                    </Header>

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