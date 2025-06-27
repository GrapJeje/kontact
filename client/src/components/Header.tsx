import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import useAuth from "../hooks/useAuth.ts";
import "./Header.scss";

interface ContactsHeaderProps {
    renderButtons: (props: {
        searching?: boolean;
        toggleSearching?: () => void;
        handleLogout?: () => void;
    }) => React.ReactNode;
}

const ContactsHeader: React.FC<ContactsHeaderProps> = ({renderButtons}) => {
    const {logout} = useAuth();
    const [searching, setSearching] = useState(false);
    const [animating, setAnimating] = useState(false);
    const navigate = useNavigate();

    const toggleSearching = () => {
        setAnimating(true);
        setTimeout(() => {
            setSearching(!searching);
            setAnimating(false);
        }, 300);
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
        <header className={"header"}>
            <div className="header-wrapper">
                <div className="header-name">
                    <h1 className="header-name-kop">Kontacts</h1>
                    <p className="header-name-small">Beheer al jouw contacten op één plek!</p>
                </div>
                <div className={`header-btn 
                    ${searching ? 'searching searching-active' : ''} 
                    ${animating ? (searching ? 'searching-active' : 'searching-inactive') : ''}`}
                >
                    {renderButtons({searching, toggleSearching, handleLogout})}
                </div>
            </div>
        </header>
    );
};

export default ContactsHeader;