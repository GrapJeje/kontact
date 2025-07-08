import React, { useEffect, useState } from "react";
import Header from "../components/Header.tsx";
import { useNavigate } from "react-router-dom";
import "./New.scss";
import useAuth from "../hooks/useAuth.ts";

interface ContactFormData {
    name: string;
    username: string;
    email: string;
    relationship: string;
    phone_number: string;
    address: {
        street: string;
        city: string;
        province: string;
        postal_code: string;
        country: string;
    };
}

interface FormErrors {
    [key: string]: string;
}

const relationshipOptions = [
    { value: '', label: 'Selecteer relatie...' },
    { value: 'Mother', label: 'Moeder' },
    { value: 'Father', label: 'Vader' },
    { value: 'Brother', label: 'Broer' },
    { value: 'Sister', label: 'Zus' },
    { value: 'Son', label: 'Zoon' },
    { value: 'Daughter', label: 'Dochter' },
    { value: 'Friend', label: 'Vriend' },
    { value: 'Family', label: 'Familie' },
    { value: 'Colleague', label: 'Collega' }
];

function New() {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        username: '',
        email: '',
        relationship: '',
        phone_number: '',
        address: {
            street: '',
            city: '',
            province: '',
            postal_code: '',
            country: 'Nederland'
        }
    });

    useEffect(() => {
        document.title = "Kontact - Nieuw Contact";
    }, []);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Naam is verplicht';
        if (!formData.phone_number.trim()) newErrors.phone_number = 'Telefoonnummer is verplicht';

        if (formData.email && !isValidEmail(formData.email))
            newErrors.email = 'Voer een geldig e-mailadres in';

        if (formData.phone_number && !isValidPhoneNumber(formData.phone_number))
            newErrors.phone_number = 'Voer een geldig telefoonnummer in';

        if (formData.address.postal_code && !isValidPostalCode(formData.address.postal_code))
            newErrors.postal_code = 'Voer een geldige postcode in (bijv. 1234AB)';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPhoneNumber = (phone: string): boolean => {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    };

    const isValidPostalCode = (postalCode: string): boolean => {
        const dutchPostalRegex = /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/;
        return dutchPostalRegex.test(postalCode);
    };

    const handleInputChange = (field: string, value: string) => {
        if (field.startsWith('address.')) {
            const addressField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors(prev => ({ ...prev, submit: '' }));

        try {
            if (!user?.id) throw new Error('Gebruiker niet ingelogd');

            const requestData = {
                user_id: parseInt(user.id),
                updates: {
                    name: formData.name.trim(),
                    username: formData.username.trim() || null,
                    email: formData.email.trim() || null,
                    phone_number: formData.phone_number.trim() || null,
                    relationship: formData.relationship || null,
                    address: (formData.address.street || formData.address.city || formData.address.province || formData.address.postal_code || formData.address.country) ? {
                        street: formData.address.street.trim() || null,
                        city: formData.address.city.trim() || null,
                        province: formData.address.province.trim() || null,
                        postal_code: formData.address.postal_code.trim() || null,
                        country: formData.address.country.trim() || null
                    } : null
                }
            };

            const response = await fetch('http://localhost:3001/api/contacts/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Server error');
            navigate('/');
        } catch (error) {
            console.error('Error:', error);
            setErrors(prev => ({
                ...prev,
                submit: error instanceof Error ? error.message : 'Er is iets misgegaan'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className="new-contact">
            <Header
                renderButtons={({ handleLogout }) => (
                    <>
                        <button onClick={() => navigate('/')} className="logout-btn" title="Terug naar overzicht">
                            <img src="/contacts/back-icon.svg" alt="Back" width="24" height="24" />
                        </button>
                        <button onClick={handleLogout} className="logout-btn" title="Uitloggen">
                            <img src="/contacts/logout-icon.svg" alt="Logout" width="24" height="24" />
                        </button>
                    </>
                )}
            />

            <div className="new-contact-body">
                <h1 className="new-contact-title">Nieuw Contact Toevoegen</h1>

                <form className="new-contact-form" onSubmit={handleSubmit}>
                    <div className="new-contact-form-section">
                        <h2 className="new-contact-form-section-title">Basisinformatie</h2>
                        <div className="new-contact-form-section-grid">
                            <div className="new-contact-form-group">
                                <label htmlFor="name">
                                    Naam <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Voor- en achternaam"
                                    className={errors.name ? 'error' : ''}
                                />
                                {errors.name && <div className="error-message">{errors.name}</div>}
                            </div>

                            <div className="new-contact-form-group">
                                <label htmlFor="username">Gebruikersnaam</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    placeholder="@gebruikersnaam"
                                />
                            </div>

                            <div className="new-contact-form-group">
                                <label htmlFor="email">E-mail</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="naam@voorbeeld.nl"
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <div className="error-message">{errors.email}</div>}
                            </div>

                            <div className="new-contact-form-group">
                                <label htmlFor="relationship">Relatie</label>
                                <select
                                    id="relationship"
                                    value={formData.relationship}
                                    onChange={(e) => handleInputChange('relationship', e.target.value)}
                                >
                                    {relationshipOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="new-contact-form-group">
                                <label htmlFor="phone_number">
                                    Telefoonnummer <span className="required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone_number"
                                    value={formData.phone_number}
                                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                                    placeholder="+31 6 12345678"
                                    className={errors.phone_number ? 'error' : ''}
                                />
                                {errors.phone_number && <div className="error-message">{errors.phone_number}</div>}
                                <div className="help-text">Inclusief landcode, bijv. +31 6 12345678</div>
                            </div>
                        </div>
                    </div>

                    <div className="new-contact-form-section">
                    <h2 className="new-contact-form-section-title">Adresgegevens</h2>
                        <div className="new-contact-form-section-grid">
                            <div className="new-contact-form-group full-width">
                                <label htmlFor="street">Straat en huisnummer</label>
                                <input
                                    type="text"
                                    id="street"
                                    value={formData.address.street}
                                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                                    placeholder="Straatnaam 123"
                                />
                            </div>

                            <div className="new-contact-form-group">
                                <label htmlFor="city">Plaats</label>
                                <input
                                    type="text"
                                    id="city"
                                    value={formData.address.city}
                                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                                    placeholder="Amsterdam"
                                />
                            </div>

                            <div className="new-contact-form-group">
                                <label htmlFor="province">Provincie</label>
                                <input
                                    type="text"
                                    id="province"
                                    value={formData.address.province}
                                    onChange={(e) => handleInputChange('address.province', e.target.value)}
                                    placeholder="Noord-Holland"
                                />
                            </div>

                            <div className="new-contact-form-group">
                                <label htmlFor="postal_code">Postcode</label>
                                <input
                                    type="text"
                                    id="postal_code"
                                    value={formData.address.postal_code}
                                    onChange={(e) => handleInputChange('address.postal_code', e.target.value)}
                                    placeholder="1234AB"
                                    className={errors.postal_code ? 'error' : ''}
                                />
                                {errors.postal_code && <div className="error-message">{errors.postal_code}</div>}
                            </div>

                            <div className="new-contact-form-group">
                                <label htmlFor="country">Land</label>
                                <input
                                    type="text"
                                    id="country"
                                    value={formData.address.country}
                                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                                    placeholder="Nederland"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="new-contact-form-actions">
                        {errors.submit && (
                            <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                                {errors.submit}
                            </div>
                        )}
                        <button
                            type="submit"
                            className="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Opslaan...' : 'Contact Opslaan'}
                        </button>
                        <button
                            type="button"
                            className="secondary"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Annuleren
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default New;