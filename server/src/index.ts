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
    console.log("Login request ontvangen:", req.body); // Log de ontvangen data

    try {
        console.log("Database query uitvoeren...");
        const [users]: any = await pool.query(
            "SELECT id, username, password FROM users WHERE username = ?",
            [req.body.username]
        );
        console.log("Query resultaat:", users);

        if (!users || users.length === 0) {
            console.log("Geen gebruiker gevonden");
            return res.status(401).json({ success: false, message: "Ongeldige credentials" });
        }

        const user = users[0];
        console.log("Gebruiker gevonden:", user.id);

        console.log("Wachtwoord vergelijken...");
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            console.log("Wachtwoord komt niet overeen");
            return res.status(401).json({ success: false, message: "Ongeldige credentials" });
        }

        console.log("JWT aanmaken...");
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1h' }
        );
        console.log("Token aangemaakt:", token);

        console.log("Sessie opslaan...");
        await pool.query(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))",
            [user.id, token]
        );
        console.log("Sessie opgeslagen");

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
            error: error.message // Voeg specifieke error toe voor debugging
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
            "SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()",
            [token]
        );

        if (sessions.length === 0) return res.status(401).json({ valid: false });

        return res.json({
            valid: true,
            user: {
                id: decoded.userId,
                username: decoded.username
            }
        });

    } catch (error) {
        return res.status(401).json({ valid: false });
    }
});

app.get("/api/users", (req: Request, res: Response) => {
    pool.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});
