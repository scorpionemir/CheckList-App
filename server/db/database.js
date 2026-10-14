
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: "-c client_encoding=UTF8",
});

pool.on("connect", (client) => {
    console.log("PostgreSQL client connected with UTF8 encoding");
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error:", error);
});

module.exports = pool;
