const express = require("express");
const pool = require("../db/database");

const authMiddleware = require("../middleware/authMiddleware");
const managerMiddleware = require("../middleware/managerMiddleware");

const {
    createUser
} = require("../controllers/usersController");

const router = express.Router();


// فقط Manager می‌تواند User جدید بسازد
router.post(
    "/",
    authMiddleware,
    managerMiddleware,
    createUser
);


// فقط Manager می‌تواند لیست کاربران را ببیند
router.get(
    "/",
    authMiddleware,
    managerMiddleware,
    async (req, res) => {
        try {
            const result = await pool.query(
                `
                SELECT
                    id,
                    username,
                    first_name,
                    last_name,
                    is_active,
                    role,
                    created_at
                FROM users
                ORDER BY created_at DESC
                `
            );

            return res.status(200).json({
                users: result.rows
            });

        } catch (error) {
            console.error("Get users error:", error);

            return res.status(500).json({
                message: "Failed to get users"
            });
        }
    }
);

module.exports = router;