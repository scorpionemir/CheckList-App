const jwt = require("jsonwebtoken");
const pool = require("../db/database");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication token is required"
            });
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const result = await pool.query(
            `
            SELECT
                id,
                username,
                role,
                is_active
            FROM users
            WHERE id = $1
            LIMIT 1
            `,
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                message: "User account is inactive"
            });
        }

        req.user = {
            userId: user.id,
            username: user.username,
            role: user.role
        };

        next();

    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(401).json({
            message: "Authentication token is invalid or expired"
        });
    }
};

module.exports = authMiddleware;