import express, {Request, Response} from "express";
import cors from "cors";
import pool from "./hooks/Pool";
import jwt from 'jsonwebtoken';
import {ResultSetHeader} from "mysql2";

const bcrypt = require('bcrypt');
const app = express();
const port = 3001;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

app.post("/api/register", async (req: Request, res: Response) => {
    const { username, password, second_password } = req.body;

    if (!username || !password || !second_password) {
        return res.status(400).json({
            success: false,
            message: "Alle velden zijn verplicht"
        });
    }

    if (password !== second_password) {
        return res.status(400).json({
            success: false,
            message: "Wachtwoorden komen niet overeen"
        });
    }

    try {
        const [users]: any = await pool.query(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );

        if (users.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Gebruikersnaam bestaat al"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const [result]: any = await pool.query(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hash]
        );

        const [newUser]: any = await pool.query(
            "SELECT id, username FROM users WHERE id = ?",
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: "Registratie succesvol",
            user: newUser[0]
        });

    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error tijdens registratie",
            error: error.message
        });
    }
});

app.post("/api/login", async (req: Request, res: Response) => {
    try {
        const [users]: any = await pool.query(
            "SELECT id, username, password FROM users WHERE username = ?",
            [req.body.username]
        );

        if (!users || users.length === 0) return res.status(401).json({ success: false, message: "Ongeldige credentials" });

        const user = users[0];
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Ongeldige credentials" });

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1h' }
        );

        await pool.query(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))",
            [user.id, token]
        );

        res.json({
            success: true,
            message: "Login succesvol",
            user: { id: user.id, username: user.username },
            token
        });

    } catch (error) {
        console.error("Fout tijdens login:", error);
        res.status(500).json({
            success: false,
            message: "Server error tijdens inloggen",
            error: error.message
        });
    }
});

app.get("/api/validate-token", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ valid: false });

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        const [sessions]: any = await pool.query(
            `SELECT * FROM sessions 
             WHERE token = ? 
             AND expires_at > NOW() 
             AND user_id = ?`,
            [token, decoded.userId]
        );

        if (sessions.length === 0) {
            await pool.query(
                "DELETE FROM sessions WHERE token = ?",
                [token]
            );
            return res.status(401).json({ valid: false });
        }

        return res.json({
            valid: true,
            user: {
                id: decoded.userId,
                username: decoded.username
            }
        });

    } catch (error) {
        await pool.query(
            "DELETE FROM sessions WHERE token = ?",
            [token]
        );
        return res.status(401).json({ valid: false });
    }
});

app.post("/api/contacts/all", async (req: Request, res: Response) => {
    const { id, limit, offset } = req.body;

    if (!id) return res.status(400).json({ success: false, message: "User ID is required" });

    try {
        const [contacts]: any = await pool.query(
            `SELECT * FROM contacts WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
            [id, limit, offset]
        );

        if (contacts.length === 0) return res.json([]);

        const contactIds = contacts.map((c: any) => c.id);

        const [addresses]: any = await pool.query(
            `SELECT * FROM addresses WHERE contact_id IN (?)`,
            [contactIds]
        );

        const contactsWithAddresses = contacts.map((contact: any) => {
            const contactAddress = addresses.find((addr: any) => addr.contact_id === contact.id);
            return {
                ...contact,
                address: contactAddress || null
            };
        });

        res.json(contactsWithAddresses);
    } catch (error: any) {
        console.error("Fout bij ophalen van contacten (all):", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
});

app.post("/api/contacts/get", async (req: Request, res: Response) => {
    const { user_id } = req.body;
    const { contact_id } = req.body;
    const limit = parseInt(req.query.limit as string) || 1;

    if (!user_id) return res.status(400).json({ success: false, message: "User ID is required" });
    if (!contact_id) return res.status(400).json({ success: false, message: "Contact ID is required" });

    try {
        const [contacts]: any = await pool.query(
            `SELECT * FROM contacts WHERE user_id = ? AND id = ? ORDER BY id DESC LIMIT ?`,
            [user_id, contact_id, limit]
        );

        if (contacts.length === 0) return res.json([]);

        const contactIds = contacts.map((c: any) => c.id);

        const [addresses]: any = await pool.query(
            `SELECT * FROM addresses WHERE contact_id IN (?)`,
            [contactIds]
        );

        const contactsWithAddresses = contacts.map((contact: any) => {
            const contactAddress = addresses.find((addr: any) => addr.contact_id === contact.id);
            return {
                ...contact,
                address: contactAddress || null
            };
        });

        res.json(contactsWithAddresses);
    } catch (error: any) {
        console.error("Fout bij ophalen van contact:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
});

app.post("/api/contacts/verifyperson", async (req: Request, res: Response) => {
    const { contact_id, user_id } = req.body;

    if (!contact_id || !user_id || isNaN(Number(contact_id)) || isNaN(Number(user_id))) {
        return res.status(400).json({
            success: false,
            message: "Ongeldige ID's - zowel contact_id als user_id moeten numerieke waarden zijn"
        });
    }

    try {
        interface ContactResult {
            id: number;
        }

        const [contacts]: [ContactResult[]] = await pool.query(
            `SELECT id FROM contacts WHERE id = ? AND user_id = ?`,
            [contact_id, user_id]
        );

        if (contacts.length === 0) {
            return res.json({
                success: true,
                valid: false,
                message: "Geen overeenkomend contact gevonden voor deze gebruiker"
            });
        }

        return res.json({
            success: true,
            valid: true,
            contact: contacts[0]
        });

    } catch (error: unknown) {
        console.error("Fout bij verifiëren van contact:", error);
        const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: errorMessage
        });
    }
});

app.post("/api/logout", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(400).json({
            success: false,
            message: "Authorization header required"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        let userId: string | null = null;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            userId = decoded.userId;
        } catch (e) {
            console.log('Token verification failed during logout, proceeding with cleanup anyway');
        }

        if (userId) {
            await pool.query(
                "DELETE FROM sessions WHERE user_id = ? OR token = ?",
                [userId, token]
            );
        } else {
            await pool.query(
                "DELETE FROM sessions WHERE token = ?",
                [token]
            );
        }

        res.json({
            success: true,
            message: "Successfully logged out"
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: "Logout failed",
            error: error.message
        });
    }
});

app.post("/api/contacts/update", async (req: Request, res: Response) => {
    const { user_id, contact_id, updates } = req.body;

    if (!user_id || !contact_id || !updates)
        return res.status(400).json({ message: "user_id, contact_id en updates zijn verplicht" });

    const {
        name = null,
        username = null,
        email = null,
        phone_number = null,
        relationship = null,
        address = null
    } = updates;

    try {
        await pool.query(
            `UPDATE contacts SET name = ?, username = ?, email = ?, phone_number = ?, relationship = ? WHERE id = ? AND user_id = ?`,
            [name, username, email, phone_number, relationship, contact_id, user_id]
        );

        if (address) {
            const {
                street = null,
                city = null,
                province = null,
                postal_code = null,
                country = null
            } = address;

            const [existingAddress] = await pool.query(
                `SELECT id FROM addresses WHERE contact_id = ?`,
                [contact_id]
            );

            if ((existingAddress as any[]).length > 0) {
                await pool.query(
                    `UPDATE addresses SET street = ?, city = ?, province = ?, postal_code = ?, country = ? WHERE contact_id = ?`,
                    [street, city, province, postal_code, country, contact_id]
                );
            } else {
                await pool.query(
                    `INSERT INTO addresses (contact_id, street, city, province, postal_code, country) VALUES (?, ?, ?, ?, ?, ?)`,
                    [contact_id, street, city, province, postal_code, country]
                );
            }
        }

        res.json({
            success: true,
            message: "Succesvol geupdate"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Er is iets misgegaan bij het updaten" });
    }
});

app.post("/api/contacts/new", async (req: Request, res: Response) => {
    const { user_id, updates } = req.body;

    if (!user_id || !updates)
        return res.status(400).json({ message: "user_id, contact_id en updates zijn verplicht" });

    const {
        name = null,
        username = null,
        email = null,
        phone_number = null,
        relationship = null,
        address = null
    } = updates;

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO contacts (user_id, name, username, email, phone_number, relationship) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, name, username, email, phone_number, relationship]
        );

        const contact_id = result.insertId;

        if (address && contact_id) {
            const {
                street = null,
                city = null,
                province = null,
                postal_code = null,
                country = null
            } = address;

            await pool.query(
                `INSERT INTO addresses (contact_id, street, city, province, postal_code, country) VALUES (?, ?, ?, ?, ?, ?)`,
                [contact_id, street, city, province, postal_code, country]
            );
        }

        res.json({
            success: true,
            message: "Succesvol aangemaakt"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Er is iets misgegaan bij het aanmaken van een nieuw contact" });
    }
});

app.post("/api/contacts/delete", async (req: Request, res: Response) => {
    const { user_id, contact_id } = req.body;

    if (!user_id || !contact_id)
        return res.status(400).json({ message: "user_id en contact_id zijn verplicht" });

    try {
        await pool.query(
            `DELETE FROM contacts WHERE user_id = ? AND id = ?`,
            [user_id, contact_id]
        );

        await pool.query(
            `DELETE FROM addresses WHERE contact_id = ?`,
            [contact_id]
        );

        res.json({ success: true, message: "Contact succesvol verwijderd" });
    } catch (error) {
        console.error("Fout bij verwijderen van contact:", error);
        res.status(500).json({ success: false, message: "Er is iets misgegaan bij het verwijderen van het contact" });
    }
});

app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});
