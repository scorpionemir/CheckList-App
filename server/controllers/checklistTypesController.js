const pool = require("../db/database");


// GET /api/checklist-types
const getChecklistTypes = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                name,
                description,
                is_active,
                created_at,
                updated_at
             FROM checklist_types
             ORDER BY created_at ASC`
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching checklist types:", error);

        res.status(500).json({
            message: "Failed to fetch checklist types"
        });
    }
};


// GET /api/checklist-types/:id
const getChecklistTypeById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                id,
                name,
                description,
                is_active,
                created_at,
                updated_at
             FROM checklist_types
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Checklist type not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error fetching checklist type:", error);

        res.status(500).json({
            message: "Failed to fetch checklist type"
        });
    }
};


// POST /api/checklist-types
const createChecklistType = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        const result = await pool.query(
            `INSERT INTO checklist_types
            (
                name,
                description
            )
            VALUES ($1, $2)
            RETURNING
                id,
                name,
                description,
                is_active,
                created_at,
                updated_at`,
            [name, description || null]
        );

        res.status(201).json({
            message: "Checklist type created successfully",
            checklistType: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating checklist type:", error);

        // Duplicate name
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Checklist type name already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create checklist type"
        });
    }
};


// PUT /api/checklist-types/:id
const updateChecklistType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        const result = await pool.query(
            `UPDATE checklist_types
             SET
                name = $1,
                description = $2,
                is_active = $3
             WHERE id = $4
             RETURNING
                id,
                name,
                description,
                is_active,
                created_at,
                updated_at`,
            [
                name,
                description || null,
                isActive ?? true,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Checklist type not found"
            });
        }

        res.json({
            message: "Checklist type updated successfully",
            checklistType: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating checklist type:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Checklist type name already exists"
            });
        }

        res.status(500).json({
            message: "Failed to update checklist type"
        });
    }
};


module.exports = {
    getChecklistTypes,
    getChecklistTypeById,
    createChecklistType,
    updateChecklistType
};