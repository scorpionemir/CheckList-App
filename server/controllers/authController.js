const pool = require("../db/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required",
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
            `,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid username or password",
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                message: "User account is inactive",
            });
        }

        const passwordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordValid) {
            return res.status(401).json({
                message: "Invalid username or password",
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.json({
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

        res.status(500).json({
            message: "Login failed",
        });
    }
};

module.exports = {
    login,
};