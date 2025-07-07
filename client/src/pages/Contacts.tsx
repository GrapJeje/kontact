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
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchContacts = async (newLimit = limit, newOffset = offset) => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("http://localhost:3001/api/contacts/all", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    id: user.id,
                    limit: newLimit,
                    offset: newOffset
                }),
                credentials: "include"
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data = await res.json();

            setHasMore(data.length === newLimit);

            if (newOffset > 0) setContacts(prev => [...prev, ...data]);
            else setContacts(data);

            setFilteredContacts(
                searchTerm.trim() === ""
                    ? data
                    : data.filter(contact =>
                        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ));
        } catch (error) {
            console.error("Fout bij het verkrijgen van alle contacten: ", error);
            setError("Failed to load contacts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Kontact - Beheer al jouw contacten op één plek!";
        if (user?.id) fetchContacts(limit, 0);
    }, [limit, user?.id]);

    const handleMore = () => {
        const newLimit = 5;
        const newOffset = contacts.length;
        fetchContacts(newLimit, newOffset).then(() => {
            setLimit(prev => prev + newLimit);
            setOffset(newOffset);
        });
    };

    const handleLess = () => {
        const newLimit = Math.max(10, limit - 5);
        setLimit(newLimit);
        setContacts(prev => prev.slice(0, newLimit));
        setFilteredContacts(prev => prev.slice(0, newLimit));
        setHasMore(true);
    };

    useEffect(() => {
        if (searchTerm.trim() === "") setFilteredContacts(contacts);
        else {
            const filtered = contacts.filter(contact =>
                contact.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredContacts(filtered);
        }
    }, [searchTerm, contacts]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const renderEmptyState = () => {
        if (searchTerm) {
            return (
                <div className="contacts-empty-state">
                    <div className="contacts-empty-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                            <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                        </svg>
                    </div>
                    <h3>Geen contacten gevonden</h3>
                    <p>Er zijn geen contacten die voldoen aan '{searchTerm}'</p>
                </div>
            );
        }

        return (
            <div className="contacts-empty-state">
                <div className="contacts-empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                        <path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                </div>
                <h3>Nog geen contacten</h3>
                <p>Voeg je eerste contact toe om te beginnen</p>
                <button
                    className="contacts-empty-button"
                    onClick={() => navigate('/new')}
                >
                    Nieuw contact toevoegen
                </button>
            </div>
        );
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
                                !loading && renderEmptyState()
                            )}
                        </div>

                        {filteredContacts.length > 0 && (
                            <div className="contacts-actions">
                                {hasMore && !searchTerm && (
                                    <button onClick={handleMore}>Load more (+5)</button>
                                )}

                                {limit > 10 && (
                                    <button onClick={handleLess}>Load less (-5)</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contacts;