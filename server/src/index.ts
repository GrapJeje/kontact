import express, {Request, Response} from "express";
import cors from "cors";
import pool from "./hooks/Pool";
import jwt from 'jsonwebtoken';

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
    const { id } = req.body;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

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

app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});
