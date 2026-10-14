const pool = require("../db/database");

const isValidUuid = (value) => {
    return (
        typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    );
};



const createChecklist = async (req, res) => {
    let client;
    let transactionStarted = false;

    try {
        const {
            checklistTypeId,
            checklistDate,
            siteName,
            data,
            clientOperationId,
        } = req.body || {};

        const userId = req.user.userId;
        const actorRole = req.user.role;

        // 1. Validate checklist type ID.
        if (
            typeof checklistTypeId !== "string" ||
            !isValidUuid(checklistTypeId)
        ) {
            return res.status(400).json({
                message: "A valid checklistTypeId is required",
            });
        }

        // 2. Validate date format and actual calendar date.
        const validDate =
            typeof checklistDate === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(checklistDate) &&
            !Number.isNaN(
                Date.parse(`${checklistDate}T00:00:00.000Z`)
            ) &&
            new Date(`${checklistDate}T00:00:00.000Z`)
                .toISOString()
                .slice(0, 10) === checklistDate;

        if (!validDate) {
            return res.status(400).json({
                message:
                    "checklistDate must be a valid date in YYYY-MM-DD format",
            });
        }

        // 3. Validate site name.
        if (
            typeof siteName !== "string" ||
            !siteName.trim() ||
            siteName.trim().length > 500
        ) {
            return res.status(400).json({
                message:
                    "siteName must be a non-empty string with at most 500 characters",
            });
        }

        // 4. Validate checklist data.
        if (
            data === null ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {
            return res.status(400).json({
                message: "data must be a valid JSON object",
            });
        }

        // 5. Validate optional offline operation ID.
        if (
            clientOperationId !== undefined &&
            clientOperationId !== null &&
            (
                typeof clientOperationId !== "string" ||
                !clientOperationId.trim() ||
                clientOperationId.trim().length > 200
            )
        ) {
            return res.status(400).json({
                message:
                    "clientOperationId must be a non-empty string of at most 200 characters",
            });
        }

        const normalizedSiteName = siteName.trim();

        const normalizedOperationId =
            typeof clientOperationId === "string"
                ? clientOperationId.trim()
                : null;

        // 6. Use one transaction for the checklist and its audit event.
        client = await pool.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        // 7. Confirm that the checklist type is active.
        const checklistTypeResult = await client.query(
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
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(400).json({
                message: "Checklist type is invalid or inactive",
            });
        }

        // 8. Preserve offline-sync idempotency.
        if (normalizedOperationId) {
            const existingChecklistResult = await client.query(
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
                [userId, normalizedOperationId]
            );

            if (existingChecklistResult.rows.length > 0) {
                await client.query("COMMIT");
                transactionStarted = false;

                return res.status(200).json({
                    message: "Checklist already processed",
                    alreadyProcessed: true,
                    checklist: existingChecklistResult.rows[0],
                });
            }
        }

        // 9. Insert the checklist.
        const result = await client.query(
            `
            INSERT INTO checklists (
                user_id,
                checklist_type_id,
                checklist_date,
                site_name,
                data,
                client_operation_id
            )
            VALUES ($1, $2, $3, $4, $5::jsonb, $6)
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
                normalizedSiteName,
                JSON.stringify(data),
                normalizedOperationId,
            ]
        );

        const checklist = result.rows[0];

        // 10. Record the creation event in the same transaction.
        await client.query(
            `
            INSERT INTO audit_logs (
                actor_id,
                action,
                target_type,
                target_id,
                details,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
            `,
            [
                userId,
                "checklist.created",
                "checklist",
                checklist.id,
                JSON.stringify({
                    checklistId: checklist.id,
                    contractorId: userId,
                    actorRole,
                    checklistTypeId,
                    checklistDate,
                    siteName: normalizedSiteName,
                }),
            ]
        );

        // 11. Commit both records together.
        await client.query("COMMIT");
        transactionStarted = false;

        return res.status(201).json({
            message: "Checklist created successfully",
            alreadyProcessed: false,
            checklist,
        });
    } catch (error) {
        if (client && transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Create checklist rollback error:",
                    rollbackError
                );
            }

            transactionStarted = false;
        }

        // A concurrent request may have inserted the same operation.
        // Check for it only after rolling back the failed transaction.
        if (
            error.code === "23505" &&
            typeof req.body?.clientOperationId === "string" &&
            req.body.clientOperationId.trim()
        ) {
            try {
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
                    [
                        req.user.userId,
                        req.body.clientOperationId.trim(),
                    ]
                );

                if (existingChecklistResult.rows.length > 0) {
                    return res.status(200).json({
                        message: "Checklist already processed",
                        alreadyProcessed: true,
                        checklist: existingChecklistResult.rows[0],
                    });
                }
            } catch (lookupError) {
                console.error(
                    "Concurrent checklist lookup error:",
                    lookupError
                );
            }
        }

        console.error("Create checklist error:", error);

        return res.status(500).json({
            message: "Failed to create checklist",
        });
    } finally {
        if (client) {
            client.release();
        }
    }
};




const getAllSubmittedChecklists = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                c.id,
                c.user_id,
                c.checklist_type_id,
                c.status,
                c.checklist_date,
                c.site_name,
                c.data,
                c.edit_allowed,
                c.created_at,
                c.updated_at,

                u.username AS contractor_username,
                u.first_name AS contractor_first_name,
                u.last_name AS contractor_last_name,
                u.is_active AS contractor_is_active

            FROM checklists c

            INNER JOIN users u
                ON u.id = c.user_id

            WHERE c.status = 'submitted'
              AND c.deleted_at IS NULL
              AND u.role = 'contractor'

            ORDER BY c.created_at DESC
        `);

        return res.status(200).json({
            checklists: result.rows,
        });
    } catch (error) {
        console.error("Get all submitted checklists error:", error);

        return res.status(500).json({
            message: "Failed to get submitted checklists",
        });
    }
};

// =====================================================
// Get deleted checklists (Trash)
// Manager and Admin only
// =====================================================

const getTrashChecklists = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                c.id,
                c.user_id,
                c.checklist_type_id,
                c.status,
                c.checklist_date,
                c.site_name,
                c.deleted_at,
                c.created_at,
                c.updated_at,

                ct.name AS checklist_type_name,

                u.username AS contractor_username,
                u.first_name AS contractor_first_name,
                u.last_name AS contractor_last_name,

                cb.delete_reason

            FROM checklists c

            INNER JOIN users u
                ON u.id = c.user_id

            LEFT JOIN checklist_types ct
                ON ct.id = c.checklist_type_id

            LEFT JOIN LATERAL (
                SELECT backup.delete_reason
                FROM checklist_backups backup
                WHERE backup.checklist_id = c.id
                ORDER BY backup.deleted_at DESC
                LIMIT 1
            ) cb ON true

            WHERE c.status = 'removed'
              AND c.deleted_at IS NOT NULL
              AND u.role = 'contractor'

            ORDER BY c.deleted_at DESC
        `);

        return res.status(200).json({
            checklists: result.rows,
        });
    } catch (error) {
        console.error("Get trash checklists error:", error);

        return res.status(500).json({
            message: "Failed to get deleted checklists",
        });
    }
};

// =====================================================
// Restore a soft-deleted checklist
// Manager and Admin only
// =====================================================

const restoreChecklist = async (req, res) => {
    let client;
    let transactionStarted = false;

    try {
        const { id } = req.params;
        const actorId = req.user.userId;
        const actorRole = req.user.role;

        if (!isValidUuid(id)) {
            return res.status(400).json({
                message: "Invalid checklist id",
            });
        }

        if (!["manager", "admin"].includes(actorRole)) {
            return res.status(403).json({
                message: "You do not have permission to restore checklists",
            });
        }

        client = await pool.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        // Lock the checklist to prevent concurrent modifications.
        const existingResult = await client.query(
            `
            SELECT
                id,
                user_id,
                checklist_type_id,
                status,
                checklist_date,
                site_name,
                deleted_at
            FROM checklists
            WHERE id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (existingResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(404).json({
                message: "Checklist not found",
            });
        }

        const checklist = existingResult.rows[0];

        if (
            checklist.status !== "removed" ||
            checklist.deleted_at === null
        ) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(409).json({
                message: "Checklist is not in the trash",
            });
        }

        // Restore the original record.
        const updateResult = await client.query(
            `
            UPDATE checklists
            SET
                status = 'submitted',
                deleted_at = NULL,
                updated_at = NOW()
            WHERE id = $1
              AND status = 'removed'
              AND deleted_at IS NOT NULL
            RETURNING
                id,
                user_id,
                checklist_type_id,
                status,
                checklist_date,
                site_name,
                deleted_at,
                created_at,
                updated_at
            `,
            [id]
        );

        if (updateResult.rows.length === 0) {
            throw new Error("Checklist could not be restored");
        }

        const restoredChecklist = updateResult.rows[0];

        // Record the restoration in checklist history.
        await client.query(
            `
            INSERT INTO checklist_edit_history (
                checklist_id,
                editor_id,
                changes
            )
            VALUES ($1, $2, $3::jsonb)
            `,
            [
                id,
                actorId,
                JSON.stringify({
                    action: "restore",
                    previous_status: "removed",
                    new_status: "submitted",
                    restored_by_role: actorRole,
                    restored_at: new Date().toISOString(),
                }),
            ]
        );

        // Record the administrative action in the audit log.
        await client.query(
            `
            INSERT INTO audit_logs (
                actor_id,
                action,
                target_type,
                target_id,
                details,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
            `,
            [
                actorId,
                "checklist.restored",
                "checklist",
                id,
                JSON.stringify({
                    checklistId: id,
                    contractorId: checklist.user_id,
                    actorRole,
                }),
            ]
        );

        await client.query("COMMIT");
        transactionStarted = false;

        return res.status(200).json({
            message: "Checklist restored successfully",
            checklist: restoredChecklist,
        });
    } catch (error) {
        if (client && transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Restore checklist rollback error:",
                    rollbackError
                );
            }
        }

        console.error("Restore checklist error:", error);

        return res.status(500).json({
            message: "Failed to restore checklist",
        });
    } finally {
        if (client) {
            client.release();
        }
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
              AND deleted_at IS NULL
            ORDER BY created_at DESC
            `,
            [userId]
        );

        return res.status(200).json({
            checklists: result.rows,
        });
    } catch (error) {
        console.error("Get my checklists error:", error);

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

        if (!isValidUuid(checklistTypeId)) {
            return res.status(400).json({
                message: "Invalid checklistTypeId",
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
              AND deleted_at IS NULL
            ORDER BY created_at DESC
            `,
            [userId, checklistTypeId]
        );

        return res.status(200).json({
            checklists: result.rows,
        });
    } catch (error) {
        console.error("Get my checklists by type error:", error);

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
        const userRole = req.user.role;
        const { id } = req.params;

        if (!isValidUuid(id)) {
            return res.status(400).json({
                message: "Invalid checklist id",
            });
        }

        if (!["manager", "admin", "contractor"].includes(userRole)) {
            return res.status(403).json({
                message: "You do not have permission to view this checklist",
            });
        }

        const values = [id];
        let ownershipCondition = "";

        // Contractors can only view their own checklists.
        if (userRole === "contractor") {
            ownershipCondition = "AND c.user_id = $2";
            values.push(userId);
        }

        const result = await pool.query(
            `
            SELECT
                c.id,
                c.user_id,
                c.checklist_type_id,
                c.status,
                c.checklist_date,
                c.site_name,
                c.data,
                c.created_at,
                c.edit_allowed,
                c.updated_at,
                c.client_operation_id,

                u.username AS contractor_username,
                u.first_name AS contractor_first_name,
                u.last_name AS contractor_last_name

            FROM checklists c

            INNER JOIN users u
                ON u.id = c.user_id

            WHERE c.id = $1
              ${ownershipCondition}
              AND c.status = 'submitted'
              AND c.deleted_at IS NULL

            LIMIT 1
            `,
            values
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
        console.error("Get checklist by id error:", error);

        return res.status(500).json({
            message: "Failed to get checklist",
        });
    }
};



// =====================================================
// Set checklist edit permission
// =====================================================

// Grant or revoke checklist edit permission
const setChecklistEditPermission = async (req, res) => {
    let client;
    let transactionStarted = false;

    try {
        const { id } = req.params;
        const { editAllowed } = req.body || {};

        const actorId = req.user.userId;
        const actorRole = req.user.role;

        // 1. Check permissions
        if (!["manager", "admin"].includes(actorRole)) {
            return res.status(403).json({
                message: "You do not have permission to change edit permissions",
            });
        }

        // 2. Validate checklist ID
        if (!isValidUuid(id)) {
            return res.status(400).json({
                message: "Invalid checklist id",
            });
        }

        // 3. Validate permission value
        if (typeof editAllowed !== "boolean") {
            return res.status(400).json({
                message: "editAllowed must be true or false",
            });
        }

        client = await pool.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        // 4. Find and lock the checklist
        const existingResult = await client.query(
            `
            SELECT
                id,
                user_id,
                status,
                edit_allowed,
                deleted_at
            FROM checklists
            WHERE id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (existingResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(404).json({
                message: "Checklist not found",
            });
        }

        const checklist = existingResult.rows[0];

        // 5. Prevent changes to deleted checklists
        if (
            checklist.deleted_at !== null ||
            checklist.status === "removed"
        ) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(409).json({
                message: "Cannot change permissions for a removed checklist",
            });
        }

        if (checklist.status !== "submitted") {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(409).json({
                message: "Only submitted checklists can have edit permissions",
            });
        }

        const previousPermission = checklist.edit_allowed;

        // 6. Update the permission
        const updateResult = await client.query(
            `
            UPDATE checklists
            SET edit_allowed = $1,
                updated_at = NOW()
            WHERE id = $2
              AND status = 'submitted'
              AND deleted_at IS NULL
            RETURNING id, user_id, edit_allowed, updated_at
            `,
            [editAllowed, id]
        );

        if (updateResult.rows.length === 0) {
            throw new Error("Checklist permission could not be updated");
        }

        const updatedChecklist = updateResult.rows[0];

        // 7. Save permission change in checklist history
        await client.query(
            `
            INSERT INTO checklist_edit_history (
                checklist_id,
                editor_id,
                changes
            )
            VALUES ($1, $2, $3::jsonb)
            `,
            [
                id,
                actorId,
                JSON.stringify({
                    action: "edit_permission_changed",
                    previous_edit_allowed: previousPermission,
                    new_edit_allowed: editAllowed,
                    changed_by_role: actorRole,
                }),
            ]
        );

        // 8. Save an administrative audit log
        await client.query(
            `
            INSERT INTO audit_logs (
                actor_id,
                action,
                target_type,
                target_id,
                details,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
            `,
            [
                actorId,
                editAllowed
                    ? "checklist.edit_permission_granted"
                    : "checklist.edit_permission_revoked",
                "checklist",
                id,
                JSON.stringify({
                    checklistId: id,
                    contractorId: checklist.user_id,
                    previousPermission,
                    newPermission: editAllowed,
                    actorRole,
                }),
            ]
        );

        // 9. Commit all changes
        await client.query("COMMIT");
        transactionStarted = false;

        return res.status(200).json({
            message: editAllowed
                ? "Edit permission granted successfully"
                : "Edit permission revoked successfully",
            checklist: updatedChecklist,
        });
    } catch (error) {
        if (client && transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Edit permission rollback error:",
                    rollbackError
                );
            }
        }

        console.error("Set checklist edit permission error:", error);

        return res.status(500).json({
            message: "Failed to update checklist edit permission",
        });
    } finally {
        if (client) {
            client.release();
        }
    }
};

// =====================================================
// Update saved checklist
// ==========================================================================================================



const updateChecklist = async (req, res) => {
    let client;
    let transactionStarted = false;

    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { id } = req.params;

        const {
            checklistDate,
            siteName,
            data,
        } = req.body || {};

        // 1. Validate checklist ID
        if (!isValidUuid(id)) {
            return res.status(400).json({
                message: "Invalid checklist id",
            });
        }

        // 2. Validate date format and actual calendar date
        const validDate =
            typeof checklistDate === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(checklistDate) &&
            !Number.isNaN(Date.parse(`${checklistDate}T00:00:00.000Z`)) &&
            new Date(`${checklistDate}T00:00:00.000Z`)
                .toISOString()
                .slice(0, 10) === checklistDate;

        if (!validDate) {
            return res.status(400).json({
                message: "checklistDate must be a valid date in YYYY-MM-DD format",
            });
        }

        // 3. Validate site name
        if (
            typeof siteName !== "string" ||
            !siteName.trim() ||
            siteName.trim().length > 500
        ) {
            return res.status(400).json({
                message: "siteName must be a non-empty string with at most 500 characters",
            });
        }

        // 4. Validate checklist data
        if (
            data === null ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {
            return res.status(400).json({
                message: "data must be a valid JSON object",
            });
        }

        // 5. Validate user role
        if (!["manager", "admin", "contractor"].includes(userRole)) {
            return res.status(403).json({
                message: "You do not have permission to edit checklists",
            });
        }

        client = await pool.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        // 6. Lock checklist during the update
        const checklistResult = await client.query(
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
                deleted_at,
                created_at,
                updated_at,
                client_operation_id
            FROM checklists
            WHERE id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (checklistResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(404).json({
                message: "Checklist not found",
            });
        }

        const oldChecklist = checklistResult.rows[0];

        // 7. Prevent editing removed checklists
        if (
            oldChecklist.deleted_at !== null ||
            oldChecklist.status === "removed"
        ) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(409).json({
                message: "Removed checklists cannot be edited",
            });
        }

        if (oldChecklist.status !== "submitted") {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(403).json({
                message: "Only submitted checklists can be edited",
            });
        }

        // 8. Enforce contractor ownership and permission
        if (userRole === "contractor") {
            if (oldChecklist.user_id !== userId) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(403).json({
                    message: "You can only edit your own checklists",
                });
            }

            if (!oldChecklist.edit_allowed) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(403).json({
                    message: "Edit permission has not been granted",
                });
            }
        }

        // 9. Update checklist and consume contractor permission
        const updateResult = await client.query(
            `
            UPDATE checklists
            SET
                checklist_date = $1,
                site_name = $2,
                data = $3::jsonb,
                edit_allowed = CASE
                    WHEN $4 = 'contractor' THEN false
                    ELSE edit_allowed
                END,
                updated_at = NOW()
            WHERE id = $5
              AND status = 'submitted'
              AND deleted_at IS NULL
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
                siteName.trim(),
                JSON.stringify(data),
                userRole,
                id,
            ]
        );

        if (updateResult.rows.length === 0) {
            throw new Error("Checklist could not be updated");
        }

        const updatedChecklist = updateResult.rows[0];

        // 10. Save before/after history
        const changes = {
            before: {
                checklist_date: oldChecklist.checklist_date,
                site_name: oldChecklist.site_name,
                data: oldChecklist.data,
                edit_allowed: oldChecklist.edit_allowed,
                updated_at: oldChecklist.updated_at,
            },
            after: {
                checklist_date: updatedChecklist.checklist_date,
                site_name: updatedChecklist.site_name,
                data: updatedChecklist.data,
                edit_allowed: updatedChecklist.edit_allowed,
                updated_at: updatedChecklist.updated_at,
            },
            editor_role: userRole,
        };

        await client.query(
            `
            INSERT INTO checklist_edit_history (
                checklist_id,
                editor_id,
                changes
            )
            VALUES ($1, $2, $3::jsonb)
            `,
            [
                id,
                userId,
                JSON.stringify(changes),
            ]
        );

        await client.query("COMMIT");
        transactionStarted = false;

        return res.status(200).json({
            message: "Checklist updated successfully",
            checklist: updatedChecklist,
        });
    } catch (error) {
        if (client && transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Update checklist rollback error:",
                    rollbackError
                );
            }
        }

        console.error("Update checklist error:", error);

        return res.status(500).json({
            message: "Failed to update checklist",
        });
    } finally {
        if (client) {
            client.release();
        }
    }
};


// Soft-delete checklist for manager and admin
const deleteChecklist = async (req, res) => {
    let client;
    let transactionStarted = false;

    try {
        const { id } = req.params;
        const actorId = req.user.userId;
        const actorRole = req.user.role;

        const providedReason = req.body?.reason;
        const deleteReason =
            typeof providedReason === "string" &&
            providedReason.trim()
                ? providedReason.trim()
                : "Deleted by manager/admin";

        if (!isValidUuid(id)) {
            return res.status(400).json({
                message: "Invalid checklist id",
            });
        }

        if (!["manager", "admin"].includes(actorRole)) {
            return res.status(403).json({
                message: "You do not have permission to delete checklists",
            });
        }

        client = await pool.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        // Lock the checklist and retrieve the complete snapshot.
        const existingResult = await client.query(
            `
            SELECT
                id,
                user_id,
                checklist_type_id,
                status,
                checklist_date,
                site_name,
                data,
                deleted_at
            FROM checklists
            WHERE id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (existingResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(404).json({
                message: "Checklist not found",
            });
        }

        const checklist = existingResult.rows[0];

        if (
            checklist.deleted_at !== null ||
            checklist.status === "removed"
        ) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(409).json({
                message: "Checklist is already removed",
            });
        }

        if (checklist.status !== "submitted") {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(409).json({
                message: "Only submitted checklists can be removed",
            });
        }

        // 1. Preserve the original checklist in the backup table.
        await client.query(
            `
            INSERT INTO checklist_backups (
                checklist_id,
                user_id,
                checklist_type_id,
                checklist_date,
                site_name,
                checklist_data,
                deleted_by,
                delete_reason,
                deleted_at
            )
            VALUES (
                $1, $2, $3, $4, $5, $6::jsonb, $7, $8, NOW()
            )
            `,
            [
                checklist.id,
                checklist.user_id,
                checklist.checklist_type_id,
                checklist.checklist_date,
                checklist.site_name,
                JSON.stringify(checklist.data),
                actorId,
                deleteReason,
            ]
        );

        // 2. Soft-delete the original record.
        const updateResult = await client.query(
            `
            UPDATE checklists
            SET
                status = 'removed',
                deleted_at = NOW(),
                updated_at = NOW()
            WHERE id = $1
              AND status = 'submitted'
              AND deleted_at IS NULL
            RETURNING
                id,
                status,
                deleted_at,
                updated_at
            `,
            [id]
        );

        if (updateResult.rows.length === 0) {
            throw new Error("Checklist could not be removed");
        }

        const removedChecklist = updateResult.rows[0];

        // 3. Record the change in checklist history.
        await client.query(
            `
            INSERT INTO checklist_edit_history (
                checklist_id,
                editor_id,
                changes
            )
            VALUES ($1, $2, $3::jsonb)
            `,
            [
                id,
                actorId,
                JSON.stringify({
                    action: "soft_delete",
                    reason: deleteReason,
                    previous_status: checklist.status,
                    new_status: "removed",
                    deleted_by_role: actorRole,
                    deleted_at: removedChecklist.deleted_at,
                }),
            ]
        );

        // 4. Record the administrative action in the audit log.
        await client.query(
            `
            INSERT INTO audit_logs (
                actor_id,
                action,
                target_type,
                target_id,
                details,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
            `,
            [
                actorId,
                "checklist.deleted",
                "checklist",
                id,
                JSON.stringify({
                    checklistId: id,
                    contractorId: checklist.user_id,
                    actorRole,
                    reason: deleteReason,
                }),
            ]
        );

        await client.query("COMMIT");
        transactionStarted = false;

        return res.status(200).json({
            message: "Checklist removed successfully",
            checklist: removedChecklist,
        });
    } catch (error) {
        if (client && transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Delete checklist rollback error:",
                    rollbackError
                );
            }
        }

        console.error("Delete checklist error:", error);

        return res.status(500).json({
            message: "Failed to remove checklist",
        });
    } finally {
        if (client) {
            client.release();
        }
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
    getTrashChecklists,
    restoreChecklist,
    deleteChecklist,
};