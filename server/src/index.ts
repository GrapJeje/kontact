import express, { Request, Response } from "express";
import cors from "cors";
import mysql from "mysql2";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "admin",
    database: "kontact",
});

app.get("/api/users", (req: Request, res: Response) => {
    pool.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});
