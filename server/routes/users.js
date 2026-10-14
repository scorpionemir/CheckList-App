
const express = require("express");

const pool = require("../db/database");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createUser,
    deactivateUser,
} = require("../controllers/usersController");

const router = express.Router();

const VALID_ROLES = ["manager", "admin", "contractor"];
const VALID_STATUSES = ["active", "inactive"];

// Create accounts. The controller validates the requested role and data.
router.post(
    "/",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    createUser
);

// List accounts with optional status and role filters.
router.get(
    "/",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    async (req, res) => {
        try {
            const { status, role } = req.query;

            if (status && !VALID_STATUSES.includes(status)) {
                return res.status(400).json({
                    message: "Invalid status filter",
                });
            }

            if (role && !VALID_ROLES.includes(role)) {
                return res.status(400).json({
                    message: "Invalid role filter",
                });
            }

            const conditions = [];
            const values = [];

            if (status) {
                values.push(status === "active");
                conditions.push(`is_active = $${values.length}`);
            }

            if (role) {
                values.push(role);
                conditions.push(`role = $${values.length}`);
            }

            const whereClause = conditions.length
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

            const result = await pool.query(
                `
                SELECT
                    id,
                    username,
                    first_name,
                    last_name,
                    national_id,
                    mobile,
                    role,
                    is_active,
                    created_at
                FROM users
                ${whereClause}
                ORDER BY created_at DESC
                `,
                values
            );

            return res.status(200).json({
                users: result.rows,
            });
        } catch (error) {
            console.error("Get users error:", error);

            return res.status(500).json({
                message: "Failed to get users",
            });
        }
    }
);

// Deactivate an account without deleting its historical records.
// The controller enforces manager-account protection and self-deactivation protection.
router.patch(
    "/:id/deactivate",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    deactivateUser
);

module.exports = router;
