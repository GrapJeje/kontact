import mysql from "mysql2/promise";

function createPool() {
    return mysql.createPool({
        host: "localhost",
        user: "root",
        password: "admin",
        database: "kontact",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

const pool = createPool();
export default pool;