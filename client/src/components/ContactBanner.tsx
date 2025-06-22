import type { Contact } from "../models/Contact.ts";

type ContactBannerProps = Contact

function ContactBanner({
                           name,
                           username,
                           email,
                           address,
                           relationship
                       }: ContactBannerProps) {
    return (
        <div className="contact-banner">
            <h1>{name}</h1>
            <h2>{username}</h2>
            <h3>{email}</h3>
            {address && (
                <p>
                    {address.street}, {address.city}, {address.province} {address.postalCode}
                    , {address.country}
                </p>
            )}
            <p>Relationship: {relationship}</p>
        </div>
    );
}

export default ContactBanner;