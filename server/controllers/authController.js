
const pool = require("../db/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    try {
        const { username, password, clientType } = req.body || {};

        if (
            typeof username !== "string" ||
            !username.trim() ||
            typeof password !== "string" ||
            !password ||
            !["mobile", "web"].includes(clientType)
        ) {
            return res.status(400).json({
                message:
                    "Username, password, and a valid client type are required",
            });
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error("JWT_SECRET is not configured");

            return res.status(500).json({
                message: "Server authentication configuration error",
            });
        }

        const result = await pool.query(
            `
            SELECT
                id,
                username,
                password_hash,
                first_name,
                last_name,
                is_active,
                role
            FROM users
            WHERE username = $1
            LIMIT 1
            `,
            [username.trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid username or password",
            });
        }

        const user = result.rows[0];

        const passwordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordValid) {
            return res.status(401).json({
                message: "Invalid username or password",
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                message: "User account is inactive",
            });
        }

        const allowedRoles =
            clientType === "web"
                ? ["manager", "admin"]
                : ["contractor"];

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                message:
                    "This account is not permitted to sign in to this application",
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
            },
            jwtSecret,
            {
                expiresIn: "7d",
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Login failed",
        });
    }
};

module.exports = {
    login,
};
