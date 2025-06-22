import express, {Request, Response} from "express";
import cors from "cors";
import pool from "./hooks/Pool";

const bcrypt = require('bcrypt');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.post("/api/register", (req: Request, res: Response) => {
    const {username, password, second_password} = req.body;

    if (password !== second_password) {
        res.status(400).send("Wachtwoorden komen niet overeen");
        return;
    }

    pool.query(
        "SELECT username FROM users WHERE username = ?",
        [username],
        (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send("Server error");
                return;
            }

            const rows = results as any[];
            if (rows.length > 0) {
                res.status(400).send("Gebruikersnaam bestaat al");
                return;
            }
        }
    );

    const saltRounds = 10;

    bcrypt.genSalt(saltRounds, (err: any, salt: any) => {
        if (err) {
            console.error(err);
            res.status(500).send("Server error");
            return;
        }

        bcrypt.hash(password, salt, (err: any, hash: any) => {
            if (err) {
                console.error(err);
                res.status(500).send("Server error");
                return;
            }

            pool.query(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                [username, hash],
                (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send("Server error");
                        return;
                    }

                    res.status(200).send("Registratie succesvol");
                }
            );
        });

    });
});

app.post("/api/login", (req: Request, res: Response) => {
    const {username, password} = req.body;

    pool.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Server error");
            return;
        }

        const user = results[0];
        if (!user) {
            res.status(401).send("Ongeldige gebruikersnaam of wachtwoord");
            return;
        }

        bcrypt.compare(password, user.password, (err: any, isMatch: any) => {
            if (err) {
                console.error(err);
                res.status(500).send("Server error");
                return;
            }

            if (!isMatch) {
                res.status(401).send("Ongeldige gebruikersnaam of wachtwoord");
                return;
            }

            res.status(200).send("Login succesvol");
        });
    });
});

app.get("/api/getToken", (req: Request, res: Response) => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    res.status(200).send(Array.from(array, b => b.toString(16).padStart(2, '0')).join(''));
    return;
});

app.get("/api/user/getByToken", (req: Request, res: Response) => {
    const token = req.query.token as string;

    if (!token) {
        res.status(400).send("Token is verplicht")
        return;
    }

    pool.query("SELECT * FROM sessions WHERE token = ?", [token], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Server error");
            return;
        }

        if (results.length === 0) return res.status(404).send("Gebruiker niet gevonden");

        const user = results[0];
        res.status(200).send(res.json(user));
        return ;
    });
});

app.get("/api/user/setToken", (req: Request, res: Response) => {
    const token = req.query.token as string;
    const id = req.query.id as string;

    if (!token || !id) {
        res.status(400).send("Token en id is verplicht")
        return;
    }

    pool.query(
        "INSERT INTO sessions (token, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE token = VALUES(token)",
        [token, id],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Database error");
            }

            return res.status(200).send("Token opgeslagen");
        }
    );
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
