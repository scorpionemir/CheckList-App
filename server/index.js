const express = require("express");
const cors = require("cors");
const pool = require("./db/database");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const authenticateToken = require("./middleware/authMiddleware");
const checklistTypesRouter = require("./routes/checklistTypes");
const checklistOptionsRouter = require("./routes/checklistOptions");
const checklistsRouter = require("./routes/checklists");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/checklist-types", checklistTypesRouter);
app.use("/api/checklist-options", checklistOptionsRouter);
app.use("/api/checklists", checklistsRouter);

app.get("/", (req, res) => {
    res.json({
        message: "Checklist API is running"
    });
});

app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connection successful",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
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
                message: "User not found"
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                message: "User account is inactive"
            });
        }

        return res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                isActive: user.is_active
            }
        });

    } catch (error) {
        console.error("Authentication check error:", error);

        return res.status(500).json({
            message: "Failed to get user information"
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});