const pool = require("../db/database");

const managerMiddleware = async (
    req,
    res,
    next
) => {
    try {
        const userId =
            req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message:
                    "Authentication required",
            });
        }

        const result =
            await pool.query(
                `
                SELECT
                    id,
                    role,
                    is_active
                FROM users
                WHERE id = $1
                LIMIT 1
                `,
                [userId]
            );

        if (
            result.rows.length === 0
        ) {
            return res.status(404).json({
                message:
                    "User not found",
            });
        }

        const user =
            result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                message:
                    "User account is inactive",
            });
        }

        if (
            user.role !==
            "manager"
        ) {
            return res.status(403).json({
                message:
                    "Manager permission required",
            });
        }

        next();
    } catch (error) {
        console.error(
            "Manager middleware error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to verify manager permission",
        });
    }
};

module.exports =
    managerMiddleware;