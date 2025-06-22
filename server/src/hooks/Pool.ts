import mysql from "mysql2";

function pool() {
    return mysql.createPool({
        host: "localhost",
        user: "root",
        password: "admin",
        database: "kontact",
    });
}

export default pool();