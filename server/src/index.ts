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
