import express from "express";
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

app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});
