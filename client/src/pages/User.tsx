import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import Header from "../components/Header.tsx";
import useAuth from "../hooks/useAuth.ts";
import type {Contact} from "../models/Contact.ts";
import "./User.scss";

function User() {
    const {user} = useAuth();
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                const verifyRes = await fetch("http://localhost:3001/api/contacts/verifyperson", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({contact_id: id, user_id: user.id}),
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
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({contact_id: id, user_id: user.id}),
                    credentials: "include"
                });

                if (!contactRes.ok) navigate('/');

                const contactData = await contactRes.json();
                if (!Array.isArray(contactData) || contactData.length === 0)
                    navigate('/');

                const contactInfo = contactData[0];
                document.title = `Kontact - ${contactInfo.name || 'Onbekende naam'}`;

                setContact(contactInfo);

            } catch (error) {
                console.error("Fout bij het ophalen van gegevens:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user?.id, id, navigate]);

    if (loading) return <div>Loading...</div>;
    if (!contact) return <div>Contact niet gevonden</div>;

    return (
        <div>
            <Header
                renderButtons={({handleLogout}) => (
                    <>
                        <button onClick={() => navigate('/')} className="logout-btn" title="Terug naar overzicht">
                            <img src="/contacts/back-icon.svg" alt="Back" width="24" height="24"/>
                        </button>
                        <button onClick={handleLogout} className="logout-btn" title="Uitloggen">
                            <img src="/contacts/logout-icon.svg" alt="Logout" width="24" height="24"/>
                        </button>
                    </>
                )}>
            </Header>
            <div className={"user"}>
                <div className={"user-avatar"}>
                    {contact.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                <div className={"user-section"}>
                    <h1>{contact.name || 'Onbekende naam'}</h1>
                    <div className={"user-section-sub"}>
                        <h3>{contact.phone_number}</h3>
                        <h3>{contact.email}</h3>
                    </div>
                </div>

                {contact.address && (
                    <div className="address">
                        <h3>Adres:</h3>
                        <p>{contact.address.street}</p>
                        <p>{contact.address.postal_code} {contact.address.city}</p>
                        {contact.address.country && <p>{contact.address.country}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

export default User;