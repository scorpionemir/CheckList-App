const pool = require("../db/database");

const createChecklist = async (req, res) => {
    try {
        const {
            checklistTypeId,
            checklistDate,
            siteName,
            data,
            clientOperationId,
        } = req.body;

        const userId = req.user.userId;

        // =========================
        // Validation
        // =========================

        if (!checklistTypeId) {
            return res.status(400).json({
                message: "checklistTypeId is required",
            });
        }

        if (!checklistDate) {
            return res.status(400).json({
                message: "checklistDate is required",
            });
        }

        if (!siteName) {
            return res.status(400).json({
                message: "siteName is required",
            });
        }

        if (!data) {
            return res.status(400).json({
                message: "data is required",
            });
        }

        // =========================
        // Check checklist type
        // =========================

        const checklistTypeResult = await pool.query(
            `
            SELECT id
            FROM checklist_types
            WHERE id = $1
              AND is_active = true
            LIMIT 1
            `,
            [checklistTypeId]
        );

        if (checklistTypeResult.rows.length === 0) {
            return res.status(400).json({
                message: "Checklist type is invalid or inactive",
            });
        }

        // =====================================================
        // Idempotency Check
        // =====================================================
        // اگر این عملیات قبلاً با همین clientOperationId
        // برای همین کاربر انجام شده باشد، همان رکورد قبلی
        // برگردانده می‌شود و رکورد جدید ساخته نمی‌شود.

        if (clientOperationId) {
            const existingChecklistResult = await pool.query(
                `
                SELECT
                    id,
                    user_id,
                    checklist_type_id,
                    status,
                    checklist_date,
                    site_name,
                    data,
                    created_at,
                    updated_at,
                    client_operation_id
                FROM checklists
                WHERE user_id = $1
                  AND client_operation_id = $2
                LIMIT 1
                `,
                [userId, clientOperationId]
            );

            if (existingChecklistResult.rows.length > 0) {
                return res.status(200).json({
                    message: "Checklist already processed",
                    alreadyProcessed: true,
                    checklist: existingChecklistResult.rows[0],
                });
            }
        }

        // =========================
        // Create checklist
        // =========================

        try {
            const result = await pool.query(
                `
                INSERT INTO checklists
                (
                    user_id,
                    checklist_type_id,
                    checklist_date,
                    site_name,
                    data,
                    client_operation_id
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING
                    id,
                    user_id,
                    checklist_type_id,
                    status,
                    checklist_date,
                    site_name,
                    data,
                    created_at,
                    updated_at,
                    client_operation_id
                `,
                [
                    userId,
                    checklistTypeId,
                    checklistDate,
                    siteName,
                    data,
                    clientOperationId || null,
                ]
            );

            return res.status(201).json({
                message: "Checklist created successfully",
                alreadyProcessed: false,
                checklist: result.rows[0],
            });
        } catch (error) {
            // =====================================================
            // Unique Constraint Race Condition
            // =====================================================
            // ممکن است دو درخواست تقریباً همزمان با یک
            // clientOperationId ارسال شوند.
            //
            // در این حالت Unique Index دیتابیس جلوی رکورد
            // دوم را می‌گیرد.
            //
            // PostgreSQL unique violation = 23505

            if (
                error.code === "23505" &&
                clientOperationId
            ) {
                const existingChecklistResult = await pool.query(
                    `
                    SELECT
                        id,
                        user_id,
                        checklist_type_id,
                        status,
                        checklist_date,
                        site_name,
                        data,
                        created_at,
                        updated_at,
                        client_operation_id
                    FROM checklists
                    WHERE user_id = $1
                      AND client_operation_id = $2
                    LIMIT 1
                    `,
                    [userId, clientOperationId]
                );

                if (existingChecklistResult.rows.length > 0) {
                    return res.status(200).json({
                        message: "Checklist already processed",
                        alreadyProcessed: true,
                        checklist:
                            existingChecklistResult.rows[0],
                    });
                }
            }

            throw error;
        }
    } catch (error) {
        console.error(
            "Create checklist error:",
            error
        );

        return res.status(500).json({
            message: "Failed to create checklist",
        });
    }
};

const getAllSubmittedChecklists =
    async (req, res) => {
        try {

            const result =
                await pool.query(
                    `
                    SELECT
                        id,
                        user_id,
                        checklist_type_id,
                        status,
                        checklist_date,
                        site_name,
                        data,
                        edit_allowed,
                        created_at,
                        updated_at
                    FROM checklists
                    WHERE status = 'submitted'
                    ORDER BY created_at DESC
                    `
                );

            return res.status(200).json({
                checklists:
                    result.rows,
            });

        } catch (error) {

            console.error(
                "Get all submitted checklists error:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to get submitted checklists",
            });
        }
    };


// =====================================================
// Get all my checklists
// =====================================================

const getMyChecklists = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `
            SELECT
                id,
                user_id,
                checklist_type_id,
                status,
                checklist_date,
                site_name,
                data,
                created_at,
                updated_at,
                edit_allowed,
                client_operation_id
            FROM checklists
            WHERE user_id = $1
              AND status = 'submitted'
            ORDER BY created_at DESC
            `,
            [userId]
        );

        return res.status(200).json({
            checklists: result.rows,
        });
    } catch (error) {
        console.error(
            "Get my checklists error:",
            error
        );

        return res.status(500).json({
            message: "Failed to get checklists",
        });
    }
};


// =====================================================
// Get my checklists by type
// =====================================================

const getMyChecklistsByType = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { checklistTypeId } = req.params;

        if (!checklistTypeId) {
            return res.status(400).json({
                message: "checklistTypeId is required",
            });
        }

        const result = await pool.query(
            `
            SELECT
                id,
                user_id,
                checklist_type_id,
                status,
                checklist_date,
                site_name,
                data,
                created_at,
                edit_allowed,
                updated_at,
                client_operation_id
            FROM checklists
            WHERE user_id = $1
              AND checklist_type_id = $2
              AND status = 'submitted'
            ORDER BY created_at DESC
            `,
            [
                userId,
                checklistTypeId,
            ]
        );

        return res.status(200).json({
            checklists: result.rows,
        });
    } catch (error) {
        console.error(
            "Get my checklists by type error:",
            error
        );

        return res.status(500).json({
            message: "Failed to get checklists",
        });
    }
};


// =====================================================
// Get my checklist by ID
// =====================================================

const getMyChecklistById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Checklist id is required",
            });
        }

        const result = await pool.query(
            `
            SELECT
                id,
                user_id,
                checklist_type_id,
                status,
                checklist_date,
                site_name,
                data,
                created_at,
                edit_allowed,
                updated_at,
                client_operation_id
            FROM checklists
            WHERE id = $1
              AND user_id = $2
              AND status = 'submitted'
            LIMIT 1
            `,
            [
                id,
                userId,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Checklist not found",
            });
        }

        return res.status(200).json({
            checklist: result.rows[0],
        });
    } catch (error) {
        console.error(
            "Get checklist by id error:",
            error
        );

        return res.status(500).json({
            message: "Failed to get checklist",
        });
    }
};

// =====================================================
// Set checklist edit permission
// =====================================================

const setChecklistEditPermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { allowed } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Checklist id is required",
            });
        }

        if (typeof allowed !== "boolean") {
            return res.status(400).json({
                message: "allowed must be a boolean",
            });
        }

        const result = await pool.query(
            `
            UPDATE checklists
            SET
                edit_allowed = $1,
                updated_at = NOW()
            WHERE id = $2
              AND status = 'submitted'
            RETURNING
                id,
                user_id,
                checklist_type_id,
                status,
                checklist_date,
                site_name,
                data,
                edit_allowed,
                created_at,
                updated_at,
                client_operation_id
            `,
            [
                allowed,
                id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Checklist not found",
            });
        }

        return res.status(200).json({
            message: allowed
                ? "Checklist edit permission granted"
                : "Checklist edit permission revoked",

            checklist: result.rows[0],
        });
    } catch (error) {
        console.error(
            "Set checklist edit permission error:",
            error
        );

        return res.status(500).json({
            message: "Failed to update checklist edit permission",
        });
    }
};

// =====================================================
// Update saved checklist
// =====================================================

const updateChecklist = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const {
            checklistDate,
            siteName,
            data,
        } = req.body;

        // =========================
        // Validation
        // =========================

        if (!id) {
            return res.status(400).json({
                message: "Checklist id is required",
            });
        }

        if (!checklistDate) {
            return res.status(400).json({
                message: "checklistDate is required",
            });
        }

        if (!siteName) {
            return res.status(400).json({
                message: "siteName is required",
            });
        }

        if (
            data === undefined ||
            data === null
        ) {
            return res.status(400).json({
                message: "data is required",
            });
        }

        // =========================
        // Find checklist
        // =========================

        const checklistResult = await pool.query(
            `
            SELECT
                id,
                user_id,
                checklist_type_id,
                status,
                edit_allowed
            FROM checklists
            WHERE id = $1
              AND user_id = $2
            LIMIT 1
            `,
            [
                id,
                userId,
            ]
        );

        if (checklistResult.rows.length === 0) {
            return res.status(404).json({
                message: "Checklist not found",
            });
        }

        const checklist =
            checklistResult.rows[0];

        // =========================
        // Check status
        // =========================

        if (checklist.status !== "submitted") {
            return res.status(403).json({
                message:
                    "Only submitted checklists can be edited",
            });
        }

        // =========================
        // Check edit permission
        // =========================

        if (!checklist.edit_allowed) {
            return res.status(403).json({
                message:
                    "Edit permission has not been granted",
            });
        }

        // =========================
        // Update checklist
        // =========================

        const updateResult = await pool.query(
            `
            UPDATE checklists
            SET
                checklist_date = $1,
                site_name = $2,
                data = $3,
                edit_allowed = false,
                updated_at = NOW()
            WHERE id = $4
              AND user_id = $5
              AND status = 'submitted'
              AND edit_allowed = true
            RETURNING
                id,
                user_id,
                checklist_type_id,
                status,
                checklist_date,
                site_name,
                data,
                edit_allowed,
                created_at,
                updated_at,
                client_operation_id
            `,
            [
                checklistDate,
                siteName,
                data,
                id,
                userId,
            ]
        );

        if (updateResult.rows.length === 0) {
            return res.status(409).json({
                message:
                    "Checklist could not be updated",
            });
        }

        return res.status(200).json({
            message:
                "Checklist updated successfully",

            checklist:
                updateResult.rows[0],
        });
    } catch (error) {
        console.error(
            "Update checklist error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to update checklist",
        });
    }
};

module.exports = {
    createChecklist,
    getMyChecklists,
    getMyChecklistsByType,
    getMyChecklistById,
    setChecklistEditPermission,
    updateChecklist,
    getAllSubmittedChecklists,
};