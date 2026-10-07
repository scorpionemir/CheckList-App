const pool = require("../db/database");


// GET /api/checklist-options
const getChecklistOptions = async (req, res) => {
    try {
        const { checklistTypeId, fieldKey, includeInactive } = req.query;

        let query = `
            SELECT
                id,
                checklist_type_id,
                field_key,
                value,
                is_active,
                sort_order,
                created_at,
                updated_at
            FROM checklist_options
        `;

        const conditions = [];
        const values = [];

        if (includeInactive !== "true") {
          conditions.push(`is_active = true`);
        }

        if (checklistTypeId) {
            values.push(checklistTypeId);
            conditions.push(`checklist_type_id = $${values.length}`);
        }

        if (fieldKey) {
            values.push(fieldKey);
            conditions.push(`field_key = $${values.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += `
            ORDER BY field_key ASC, sort_order ASC, created_at ASC
        `;

        const result = await pool.query(query, values);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching checklist options:", error);

        res.status(500).json({
            message: "Failed to fetch checklist options"
        });
    }
};


// GET /api/checklist-options/:id
const getChecklistOptionById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                id,
                checklist_type_id,
                field_key,
                value,
                is_active,
                sort_order,
                created_at,
                updated_at
             FROM checklist_options
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Checklist option not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error fetching checklist option:", error);

        res.status(500).json({
            message: "Failed to fetch checklist option"
        });
    }
};


// POST /api/checklist-options
const createChecklistOption = async (req, res) => {
    try {
        const {
            checklistTypeId,
            fieldKey,
            value,
            sortOrder
        } = req.body;

        if (!checklistTypeId || !fieldKey || !value) {
            return res.status(400).json({
                message: "checklistTypeId, fieldKey and value are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO checklist_options
            (
                checklist_type_id,
                field_key,
                value,
                sort_order
            )
            VALUES ($1, $2, $3, $4)
            RETURNING
                id,
                checklist_type_id,
                field_key,
                value,
                is_active,
                sort_order,
                created_at,
                updated_at`,
            [
                checklistTypeId,
                fieldKey,
                value,
                sortOrder ?? 0
            ]
        );

        res.status(201).json({
            message: "Checklist option created successfully",
            checklistOption: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating checklist option:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "This checklist option already exists"
            });
        }

        if (error.code === "23503") {
            return res.status(400).json({
                message: "Checklist type does not exist"
            });
        }

        res.status(500).json({
            message: "Failed to create checklist option"
        });
    }
};


// PUT /api/checklist-options/:id
const updateChecklistOption = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            value,
            isActive,
            sortOrder
        } = req.body;

        if (!value) {
            return res.status(400).json({
                message: "value is required"
            });
        }

        const result = await pool.query(
            `UPDATE checklist_options
             SET
                value = $1,
                is_active = $2,
                sort_order = $3
             WHERE id = $4
             RETURNING
                id,
                checklist_type_id,
                field_key,
                value,
                is_active,
                sort_order,
                created_at,
                updated_at`,
            [
                value,
                isActive ?? true,
                sortOrder ?? 0,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Checklist option not found"
            });
        }

        res.json({
            message: "Checklist option updated successfully",
            checklistOption: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating checklist option:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "This checklist option already exists"
            });
        }

        res.status(500).json({
            message: "Failed to update checklist option"
        });
    }
};

const deactivateChecklistOption = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE checklist_options
             SET is_active = false
             WHERE id = $1
             RETURNING
                id,
                checklist_type_id,
                field_key,
                value,
                is_active,
                sort_order,
                created_at,
                updated_at`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Checklist option not found"
            });
        }

        res.json({
            message: "Checklist option deactivated successfully",
            checklistOption: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Error deactivating checklist option:",
            error
        );

        res.status(500).json({
            message: "Failed to deactivate checklist option"
        });
    }
};


module.exports = {
    getChecklistOptions,
    getChecklistOptionById,
    createChecklistOption,
    updateChecklistOption,
    deactivateChecklistOption
};