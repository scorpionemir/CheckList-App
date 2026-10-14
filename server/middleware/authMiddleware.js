
const jwt = require("jsonwebtoken");
const pool = require("../db/database");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (
            typeof authHeader !== "string" ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                message: "Authentication token is required",
            });
        }

        const token = authHeader.substring(7).trim();

        if (!token) {
            return res.status(401).json({
                message: "Authentication token is required",
            });
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error("JWT_SECRET is not configured");

            return res.status(500).json({
                message: "Server authentication configuration error",
            });
        }

        const decoded = jwt.verify(token, jwtSecret, {
            algorithms: ["HS256"],
        });

        if (
            !decoded ||
            typeof decoded !== "object" ||
            typeof decoded.userId !== "string" ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                decoded.userId
            )
        ) {
            return res.status(401).json({
                message: "Invalid authentication token",
            });
        }

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
                message: "User not found",
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                message: "User account is inactive",
            });
        }

        req.user = {
            userId: user.id,
            username: user.username,
            role: user.role,
        };

        return next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                message: "Authentication token is invalid or expired",
            });
        }

        console.error("Authentication error:", error);

        return res.status(500).json({
            message: "Authentication service error",
        });
    }
};

module.exports = authMiddleware;
