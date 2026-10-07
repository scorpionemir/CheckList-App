// const express = require("express");

// const {
//     login
// } = require("../controllers/authController");

// const loginRateLimiter = require("../middleware/loginRateLimiter");

// const router = express.Router();

// router.post(
//     "/login",
//     loginRateLimiter,
//     login
// );

// module.exports = router;

const express = require("express");

const {
    login,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const loginRateLimiter = require("../middleware/loginRateLimiter");

const router = express.Router();


// Login
router.post(
    "/login",
    loginRateLimiter,
    login
);


// Current authenticated user
router.get(
    "/me",
    authMiddleware,
    async (req, res) => {
        try {
            const pool = require("../db/database");

            const result = await pool.query(
                `
                SELECT
                    id,
                    username,
                    first_name,
                    last_name,
                    role,
                    is_active
                FROM users
                WHERE id = $1
                LIMIT 1
                `,
                [req.user.userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            const user = result.rows[0];

            return res.status(200).json({
                user: {
                    id: user.id,
                    username: user.username,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    isActive: user.is_active,
                },
            });
        } catch (error) {
            console.error(
                "Get current user error:",
                error
            );

            return res.status(500).json({
                message: "Failed to get current user",
            });
        }
    }
);


module.exports = router;