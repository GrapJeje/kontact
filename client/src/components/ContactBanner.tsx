import type {Contact} from "../models/Contact.ts";
import {useNavigate} from "react-router-dom";

type ContactBannerProps = Contact

function ContactBanner({
                           id,
                           name,
                           username,
                           phone_number,
                           email,
                           address,
                           relationship
                       }: ContactBannerProps) {
    const navigate = useNavigate();

    return (
        <div className="contact-banner">
            <div className="contact-banner-avatar">
                {name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            <div className="contact-banner-content">
                <h1 className="contact-banner-name">{name}</h1>
                {username && (
                    <h2 className="contact-banner-username">@{username}</h2>
                )}

                {phone_number && (
                    <h3 className="contact-banner-phoneNumber">{phone_number}</h3>
                )}

                {email && (
                    <h3 className="contact-banner-email">{email}</h3>
                )}

                {address && (
                    <p className="contact-banner-address">
                        {address.street}, {address.city}, {address.province} {address.postal_code}, {address.country}
                    </p>
                )}

                {relationship && (
                    <p className="contact-banner-relationship">{relationship}</p>
                )}
            </div>

            <div className="contact-banner-actions">
                <button onClick={() => navigate(`/user/${id}`)}
                        className="contact-banner-action contact-banner-action-edit" title="Edit contact">
                    <img src="/contacts/edit.svg" alt="Add" width="24" height="24"/>
                </button>
            </div>
        </div>
    );
}

export default ContactBanner;