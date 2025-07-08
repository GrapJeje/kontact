import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header.tsx";
import useAuth from "../hooks/useAuth.ts";
import type { Contact } from "../models/Contact.ts";
import "./User.scss";

function User() {
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [editedContact, setEditedContact] = useState<Contact | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                const verifyRes = await fetch("http://localhost:3001/api/contacts/verifyperson", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contact_id: id, user_id: user.id }),
                    credentials: "include"
                });

                if (!verifyRes.ok) {
                    navigate('/');
                    return;
                }

                const verifyData = await verifyRes.json();
                if (!verifyData.valid) {
                    navigate('/');
                    return;
                }

                const contactRes = await fetch(`http://localhost:3001/api/contacts/get`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contact_id: id, user_id: user.id }),
                    credentials: "include"
                });

                if (!contactRes.ok) navigate('/');

                const contactData = await contactRes.json();
                if (!Array.isArray(contactData) || contactData.length === 0)
                    navigate('/');

                const contactInfo = contactData[0];
                document.title = `Kontact - ${contactInfo.name || 'Onbekende naam'}`;

                setContact(contactInfo);
                setEditedContact(contactInfo);

            } catch (error) {
                console.error("Fout bij het ophalen van gegevens:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user?.id, id, navigate]);

    const handleChange = (field: string, value: string) => {
        setEditedContact(prev => {
            if (!prev) return null;

            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                return {
                    ...prev,
                    [parent]: {
                        ...prev[parent as keyof Contact],
                        [child]: value
                    }
                } as Contact;
            }
            return {
                ...prev,
                [field]: value
            };
        });
    };

    const handleSave = async () => {
        if (!editedContact || !user?.id) return;

        try {
            const res = await fetch("http://localhost:3001/api/contacts/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contact_id: id,
                    user_id: user.id,
                    updates: editedContact
                }),
                credentials: "include"
            });

            if (res.ok) {
                setContact(editedContact);
            } else {
                console.error("Opslaan mislukt");
            }
        } catch (error) {
            console.error("Fout bij opslaan:", error);
        }
    };

    const handleDelete = async () => {
        if (!editedContact || !user?.id) return;

        try {
            const res = await fetch("http://localhost:3001/api/contacts/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contact_id: id,
                    user_id: user.id
                }),
                credentials: "include"
            });

            if (!res.ok) throw new Error("Verwijderen mislukt");
            navigate('/');
        } catch (error) {
            console.error("Fout bij opslaan:", error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!contact || !editedContact) return <div>Contact niet gevonden</div>;

    return (
        <div>
            <Header
                renderButtons={({ handleLogout }) => (
                    <>
                        <button onClick={() => navigate('/')} className="logout-btn" title="Terug naar overzicht">
                            <img src="/contacts/back-icon.svg" alt="Back" width="24" height="24"/>
                        </button>
                        <button onClick={handleLogout} className="logout-btn" title="Uitloggen">
                            <img src="/contacts/logout-icon.svg" alt="Logout" width="24" height="24"/>
                        </button>
                    </>
                )}
            />
            <div className="user">
                <div className="user-avatar">
                    {editedContact.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                <div className="user-section">
                    <input
                        type="text"
                        value={editedContact.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="user-input name-input"
                        placeholder="Naam"
                    />

                    <div className="user-section-sub">
                        <input
                            type="tel"
                            value={editedContact.phone_number || ''}
                            onChange={(e) => handleChange('phone_number', e.target.value)}
                            className="user-input"
                            placeholder="Telefoonnummer"
                        />
                        <input
                            type="email"
                            value={editedContact.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="user-input"
                            placeholder="Email"
                        />
                    </div>
                </div>

                {editedContact.address && (
                    <div className="address">
                        <h3>Adres:</h3>
                        <input
                            type="text"
                            value={editedContact.address.street || ''}
                            onChange={(e) => handleChange('address.street', e.target.value)}
                            className="user-input"
                            placeholder="Straatnaam en huisnummer"
                        />
                        <div className="address-row">
                            <input
                                type="text"
                                value={editedContact.address.postal_code || ''}
                                onChange={(e) => handleChange('address.postal_code', e.target.value)}
                                className="user-input"
                                placeholder="Postcode"
                            />
                            <input
                                type="text"
                                value={editedContact.address.city || ''}
                                onChange={(e) => handleChange('address.city', e.target.value)}
                                className="user-input"
                                placeholder="Stad"
                            />
                        </div>
                        <input
                            type="text"
                            value={editedContact.address.country || ''}
                            onChange={(e) => handleChange('address.country', e.target.value)}
                            className="user-input"
                            placeholder="Land (optioneel)"
                        />
                    </div>
                )}

                <div className="option-btn">
                    <button className="save-button btn" onClick={handleSave}>
                        Opslaan
                    </button>

                    <button className="delete-button btn" onClick={handleDelete}>
                        Verwijderen
                    </button>
                </div>
            </div>
        </div>
    );
}

export default User;