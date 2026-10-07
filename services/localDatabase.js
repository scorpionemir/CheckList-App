import * as SQLite from "expo-sqlite";

const DATABASE_NAME =
    "checklist_local.db";

const DRAFT_MAX_AGE_MS =
    60 * 60 * 1000;

const PROCESSING_TIMEOUT_MS =
    5 * 60 * 1000;

// ============================================================
// Retry & Backoff
// ============================================================

const MAX_RETRIES = 5;

const RETRY_BASE_DELAY_MS =
    5000;

const RETRY_MAX_DELAY_MS =
    5 * 60 * 1000;


let databasePromise = null;


// ============================================================
// Database
// ============================================================

const getDatabase = async () => {

    if (!databasePromise) {

        databasePromise =
            SQLite.openDatabaseAsync(
                DATABASE_NAME
            );
    }

    return databasePromise;
};


// ============================================================
// Helpers
// ============================================================

const generateId = () => {

    return (
        Date.now().toString() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );
};


export const generateClientOperationId = () => {

    return generateId();
};


const normalizeDate = (
    value
) => {

    if (!value) {
        return null;
    }

    if (
        value instanceof Date
    ) {
        return value.toISOString();
    }

    return value;
};


const restoreChecklistDates = (
    data
) => {

    if (!data) {
        return data;
    }

    const restored = {
        ...data,
    };

    if (
        restored.visit
    ) {

        restored.visit = {
            ...restored.visit,

            date:
                restored.visit.date
                    ? new Date(
                        restored.visit.date
                    )
                    : null,

            entryTime:
                restored.visit.entryTime
                    ? new Date(
                        restored.visit.entryTime
                    )
                    : null,

            exitTime:
                restored.visit.exitTime
                    ? new Date(
                        restored.visit.exitTime
                    )
                    : null,
        };
    }

    return restored;
};


const isDraftExpired = (
    updatedAt
) => {

    if (!updatedAt) {
        return true;
    }

    const updatedTime =
        new Date(
            updatedAt
        ).getTime();

    if (
        Number.isNaN(
            updatedTime
        )
    ) {
        return true;
    }

    return (
        Date.now() -
            updatedTime >
        DRAFT_MAX_AGE_MS
    );
};


// ============================================================
// Initialize Database
// ============================================================

export const initializeDatabase =
    async () => {

        const db =
            await getDatabase();

        await db.execAsync(`
            PRAGMA journal_mode = WAL;

            CREATE TABLE IF NOT EXISTS drafts (
                id TEXT PRIMARY KEY NOT NULL,

                user_id TEXT NOT NULL,

                checklist_type_id TEXT NOT NULL,

                checklist_date TEXT,

                site_name TEXT,

                data TEXT NOT NULL,

                created_at TEXT NOT NULL,

                updated_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS
            idx_drafts_user_id
            ON drafts(user_id);

            CREATE INDEX IF NOT EXISTS
            idx_drafts_updated_at
            ON drafts(updated_at);


            CREATE TABLE IF NOT EXISTS sync_queue (
                id TEXT PRIMARY KEY NOT NULL,

                user_id TEXT NOT NULL,

                operation_type TEXT NOT NULL,

                entity_type TEXT NOT NULL,

                entity_id TEXT,

                client_operation_id TEXT NOT NULL,

                payload TEXT NOT NULL,

                status TEXT NOT NULL DEFAULT 'pending',

                retry_count INTEGER NOT NULL DEFAULT 0,

                last_error TEXT,

                next_retry_at TEXT,

                created_at TEXT NOT NULL,

                updated_at TEXT NOT NULL
            );

            CREATE UNIQUE INDEX IF NOT EXISTS
            idx_sync_queue_client_operation
            ON sync_queue(client_operation_id);

            CREATE INDEX IF NOT EXISTS
            idx_sync_queue_user_status
            ON sync_queue(user_id, status);

            CREATE INDEX IF NOT EXISTS
            idx_sync_queue_created_at
            ON sync_queue(created_at);
        `);


        // ====================================================
        // Migration
        // ====================================================

        const columns =
            await db.getAllAsync(`
                PRAGMA table_info(sync_queue)
            `);


        const hasNextRetryAt =
            columns.some(
                (column) =>
                    column.name ===
                    "next_retry_at"
            );


        if (!hasNextRetryAt) {

            await db.execAsync(`
                ALTER TABLE sync_queue
                ADD COLUMN next_retry_at TEXT
            `);
        }


        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS
            idx_sync_queue_next_retry_at
            ON sync_queue(next_retry_at);
        `);


        return db;
    };


// ============================================================
// Initialize automatically
// ============================================================

initializeDatabase().catch(
    (error) => {

        console.error(
            "Local database initialization error:",
            error
        );
    }
);


// ============================================================
// Drafts
// ============================================================

export const removeExpiredDrafts = async (
    userId = null
) => {
    const db = await getDatabase();

    const expirationTime = new Date(
        Date.now() - DRAFT_MAX_AGE_MS
    ).toISOString();

    if (userId) {
        await db.runAsync(
            `
            DELETE FROM drafts
            WHERE user_id = ?
            AND updated_at < ?
            `,
            [
                userId,
                expirationTime,
            ]
        );
    } else {
        await db.runAsync(
            `
            DELETE FROM drafts
            WHERE updated_at < ?
            `,
            [
                expirationTime,
            ]
        );
    }

    return Date.now();
};


export const saveDraft =
    async ({
        id = null,
        userId,
        checklistTypeId,
        checklistDate = null,
        siteName = "",
        data,
    }) => {

        if (!userId) {

            throw new Error(
                "userId is required."
            );
        }

        if (!checklistTypeId) {

            throw new Error(
                "checklistTypeId is required."
            );
        }

        if (!data) {

            throw new Error(
                "Draft data is required."
            );
        }


        const db =
            await getDatabase();

        const now =
            new Date().toISOString();


        const serializedData =
            JSON.stringify(
                data,
                (
                    key,
                    value
                ) => {

                    if (
                        value instanceof Date
                    ) {

                        return value.toISOString();
                    }

                    return value;
                }
            );


        if (id) {

            const existing =
                await db.getFirstAsync(
                    `
                    SELECT
                        id,
                        updated_at,
                        created_at
                    FROM drafts
                    WHERE id = ?
                    AND user_id = ?
                    `,
                    [
                        id,
                        userId,
                    ]
                );


            if (!existing) {

                throw new Error(
                    "Draft not found."
                );
            }


            if (
                isDraftExpired(
                    existing.updated_at
                )
            ) {

                await db.runAsync(
                    `
                    DELETE FROM drafts
                    WHERE id = ?
                    AND user_id = ?
                    `,
                    [
                        id,
                        userId,
                    ]
                );


                throw new Error(
                    "Draft has expired."
                );
            }


            await db.runAsync(
                `
                UPDATE drafts

                SET
                    checklist_type_id = ?,
                    checklist_date = ?,
                    site_name = ?,
                    data = ?,
                    updated_at = ?

                WHERE id = ?
                AND user_id = ?
                `,
                [
                    checklistTypeId,

                    normalizeDate(
                        checklistDate
                    ),

                    siteName,

                    serializedData,

                    now,

                    id,

                    userId,
                ]
            );


            return {
                id,

                userId,

                checklistTypeId,

                checklistDate:
                    normalizeDate(
                        checklistDate
                    ),

                siteName,

                data,

                createdAt:
                    existing.created_at,

                updatedAt:
                    now,

                isUpdated:
                    true,
            };
        }


        const draftId =
            generateId();


        await db.runAsync(
            `
            INSERT INTO drafts (
                id,
                user_id,
                checklist_type_id,
                checklist_date,
                site_name,
                data,
                created_at,
                updated_at
            )

            VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
            )
            `,
            [
                draftId,

                userId,

                checklistTypeId,

                normalizeDate(
                    checklistDate
                ),

                siteName,

                serializedData,

                now,

                now,
            ]
        );


        return {
            id: draftId,

            userId,

            checklistTypeId,

            checklistDate:
                normalizeDate(
                    checklistDate
                ),

            siteName,

            data,

            createdAt:
                now,

            updatedAt:
                now,

            isUpdated:
                false,
        };
    };


export const getDrafts =
    async (
        userId
    ) => {

        if (!userId) {
            return [];
        }


        await removeExpiredDrafts(
            userId
        );


        const db =
            await getDatabase();


        const rows =
            await db.getAllAsync(
                `
                SELECT
                    id,
                    user_id,
                    checklist_type_id,
                    checklist_date,
                    site_name,
                    data,
                    created_at,
                    updated_at

                FROM drafts

                WHERE user_id = ?

                ORDER BY
                    updated_at DESC
                `,
                [
                    userId,
                ]
            );


        return rows.map(
            (row) => {

                let parsedData =
                    {};

                try {

                    parsedData =
                        JSON.parse(
                            row.data
                        );

                } catch (error) {

                    console.error(
                        "Draft JSON parse error:",
                        error
                    );
                }


                return {

                    id:
                        row.id,

                    userId:
                        row.user_id,

                    checklistTypeId:
                        row.checklist_type_id,

                    checklistDate:
                        row.checklist_date,

                    siteName:
                        row.site_name,

                    data:
                        restoreChecklistDates(
                            parsedData
                        ),

                    createdAt:
                        row.created_at,

                    updatedAt:
                        row.updated_at,
                };
            }
        );
    };


export const getDraftById =
    async (
        id,
        userId
    ) => {

        if (
            !id ||
            !userId
        ) {
            return null;
        }


        await removeExpiredDrafts(
            userId
        );


        const db =
            await getDatabase();


        const row =
            await db.getFirstAsync(
                `
                SELECT
                    id,
                    user_id,
                    checklist_type_id,
                    checklist_date,
                    site_name,
                    data,
                    created_at,
                    updated_at

                FROM drafts

                WHERE id = ?
                AND user_id = ?
                `,
                [
                    id,
                    userId,
                ]
            );


        if (!row) {
            return null;
        }


        let parsedData =
            {};


        try {

            parsedData =
                JSON.parse(
                    row.data
                );

        } catch (error) {

            console.error(
                "Draft JSON parse error:",
                error
            );
        }


        return {

            id:
                row.id,

            userId:
                row.user_id,

            checklistTypeId:
                row.checklist_type_id,

            checklistDate:
                row.checklist_date,

            siteName:
                row.site_name,

            data:
                restoreChecklistDates(
                    parsedData
                ),

            createdAt:
                row.created_at,

            updatedAt:
                row.updated_at,
        };
    };


export const deleteDraft =
    async (
        id,
        userId
    ) => {

        if (
            !id ||
            !userId
        ) {
            return;
        }


        const db =
            await getDatabase();


        await db.runAsync(
            `
            DELETE FROM drafts
            WHERE id = ?
            AND user_id = ?
            `,
            [
                id,
                userId,
            ]
        );
    };


// ============================================================
// Sync Queue
// ============================================================

export const enqueueSyncOperation =
    async ({
        userId,
        operationType,
        entityType,
        entityId = null,
        clientOperationId,
        payload,
    }) => {

        if (!userId) {

            throw new Error(
                "userId is required."
            );
        }


        if (!clientOperationId) {

            throw new Error(
                "clientOperationId is required."
            );
        }


        if (!payload) {

            throw new Error(
                "Sync payload is required."
            );
        }


        const db =
            await getDatabase();


        const existing =
            await db.getFirstAsync(
                `
                SELECT *
                FROM sync_queue
                WHERE client_operation_id = ?
                `,
                [
                    clientOperationId,
                ]
            );


        if (existing) {

            return {

                id:
                    existing.id,

                clientOperationId:
                    existing.client_operation_id,

                status:
                    existing.status,

                isExisting:
                    true,
            };
        }


        const id =
            generateId();


        const now =
            new Date().toISOString();


        await db.runAsync(
            `
            INSERT INTO sync_queue (
                id,
                user_id,
                operation_type,
                entity_type,
                entity_id,
                client_operation_id,
                payload,
                status,
                retry_count,
                last_error,
                next_retry_at,
                created_at,
                updated_at
            )

            VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                'pending',
                0,
                NULL,
                NULL,
                ?,
                ?
            )
            `,
            [
                id,

                userId,

                operationType,

                entityType,

                entityId,

                clientOperationId,

                JSON.stringify(
                    payload
                ),

                now,

                now,
            ]
        );


        return {

            id,

            userId,

            operationType,

            entityType,

            entityId,

            clientOperationId,

            payload,

            status:
                "pending",

            retryCount:
                0,

            lastError:
                null,

            nextRetryAt:
                null,

            createdAt:
                now,

            updatedAt:
                now,

            isExisting:
                false,
        };
    };


// ============================================================
// Crash Recovery
// ============================================================

export const recoverStuckSyncOperations =
    async () => {

        const db =
            await getDatabase();


        const now =
            Date.now();


        const rows =
            await db.getAllAsync(
                `
                SELECT
                    id,
                    updated_at
                FROM sync_queue
                WHERE status = 'processing'
                `
            );


        let recoveredCount =
            0;


        for (
            const row of rows
        ) {

            const updatedTime =
                new Date(
                    row.updated_at
                ).getTime();


            if (
                Number.isNaN(
                    updatedTime
                )
            ) {

                continue;
            }


            const isStuck =
                now -
                    updatedTime >
                PROCESSING_TIMEOUT_MS;


            if (!isStuck) {
                continue;
            }


            await db.runAsync(
                `
                UPDATE sync_queue

                SET
                    status = 'pending',

                    updated_at = ?,

                    last_error = ?,

                    next_retry_at = NULL

                WHERE id = ?

                AND status = 'processing'
                `,
                [
                    new Date()
                        .toISOString(),

                    "Recovered after interrupted sync.",

                    row.id,
                ]
            );


            recoveredCount++;
        }


        if (
            recoveredCount > 0
        ) {

            console.log(
                `Recovered ${recoveredCount} stuck sync operation(s).`
            );
        }


        return recoveredCount;
    };


// ============================================================
// Get Pending Sync Operations
// ============================================================

export const getPendingSyncOperations =
    async (
        limit = 20
    ) => {

        const db =
            await getDatabase();


        const now =
            new Date()
                .toISOString();


        const rows =
            await db.getAllAsync(
                `
                SELECT
                    id,
                    user_id,
                    operation_type,
                    entity_type,
                    entity_id,
                    client_operation_id,
                    payload,
                    status,
                    retry_count,
                    last_error,
                    next_retry_at,
                    created_at,
                    updated_at

                FROM sync_queue

                WHERE
                    status = 'pending'

                    AND (
                        next_retry_at IS NULL
                        OR next_retry_at <= ?
                    )

                ORDER BY
                    created_at ASC

                LIMIT ?
                `,
                [
                    now,
                    limit,
                ]
            );


        return rows.map(
            (row) => {

                let payload =
                    {};


                try {

                    payload =
                        JSON.parse(
                            row.payload
                        );

                } catch (error) {

                    console.error(
                        "Sync queue JSON parse error:",
                        error
                    );
                }


                return {

                    id:
                        row.id,

                    userId:
                        row.user_id,

                    operationType:
                        row.operation_type,

                    entityType:
                        row.entity_type,

                    entityId:
                        row.entity_id,

                    clientOperationId:
                        row.client_operation_id,

                    payload,

                    status:
                        row.status,

                    retryCount:
                        Number(
                            row.retry_count
                        ) || 0,

                    lastError:
                        row.last_error,

                    nextRetryAt:
                        row.next_retry_at,

                    createdAt:
                        row.created_at,

                    updatedAt:
                        row.updated_at,
                };
            }
        );
    };


// ============================================================
// Retry & Backoff
// ============================================================

export const markSyncOperationRetry =
    async (
        id,
        errorMessage,
        options = {}
    ) => {

        const db =
            await getDatabase();


        const maxRetries =
            Number(
                options.maxRetries
            ) ||
            MAX_RETRIES;


        const baseDelayMs =
            Number(
                options.baseDelayMs
            ) ||
            RETRY_BASE_DELAY_MS;


        const maxDelayMs =
            Number(
                options.maxDelayMs
            ) ||
            RETRY_MAX_DELAY_MS;


        const operation =
            await db.getFirstAsync(
                `
                SELECT
                    retry_count
                FROM sync_queue
                WHERE id = ?
                `,
                [
                    id,
                ]
            );


        if (!operation) {

            throw new Error(
                "Sync operation not found."
            );
        }


        const currentRetryCount =
            Number(
                operation.retry_count
            ) || 0;


        const nextRetryCount =
            currentRetryCount + 1;


        const now =
            new Date()
                .toISOString();


        const message =
            errorMessage ||
            "Unknown sync error.";


        // ====================================================
        // Maximum Retry Reached
        // ====================================================

        if (
            nextRetryCount >=
            maxRetries
        ) {

            await db.runAsync(
                `
                UPDATE sync_queue

                SET
                    status = 'failed',

                    retry_count = ?,

                    last_error = ?,

                    next_retry_at = NULL,

                    updated_at = ?

                WHERE id = ?
                `,
                [
                    nextRetryCount,

                    message,

                    now,

                    id,
                ]
            );


            return {

                status:
                    "failed",

                retryCount:
                    nextRetryCount,

                nextRetryAt:
                    null,
            };
        }


        // ====================================================
        // Exponential Backoff
        // ====================================================

        const exponent =
            Math.max(
                nextRetryCount - 1,
                0
            );


        const delay =
            Math.min(
                baseDelayMs *
                    Math.pow(
                        2,
                        exponent
                    ),
                maxDelayMs
            );


        const nextRetryAt =
            new Date(
                Date.now() +
                    delay
            ).toISOString();


        await db.runAsync(
            `
            UPDATE sync_queue

            SET
                status = 'pending',

                retry_count = ?,

                last_error = ?,

                next_retry_at = ?,

                updated_at = ?

            WHERE id = ?
            `,
            [
                nextRetryCount,

                message,

                nextRetryAt,

                now,

                id,
            ]
        );

        return {

            status:
                "pending",

            retryCount:
                nextRetryCount,

            nextRetryAt,

            delay,
        };
    };

export const markSyncOperationFailed =
    async (
        id,
        errorMessage
    ) => {

        const db =
            await getDatabase();


        const now =
            new Date()
                .toISOString();


        await db.runAsync(
            `
            UPDATE sync_queue

            SET
                status = 'failed',

                last_error = ?,

                next_retry_at = NULL,

                updated_at = ?

            WHERE id = ?
            `,
            [
                errorMessage ||
                    "Sync operation failed.",

                now,

                id,
            ]
        );


        return {
            status:
                "failed",
        };
    };


// ============================================================
// Mark Processing
// ============================================================

export const markSyncOperationProcessing =
    async (
        id
    ) => {

        const db =
            await getDatabase();


        const now =
            new Date()
                .toISOString();


        await db.runAsync(
            `
            UPDATE sync_queue

            SET
                status = 'processing',

                next_retry_at = NULL,

                updated_at = ?

            WHERE id = ?
            `,
            [
                now,

                id,
            ]
        );
    };


// ============================================================
// Delete Sync Operation
// ============================================================

export const deleteSyncOperation =
    async (
        id
    ) => {

        const db =
            await getDatabase();


        await db.runAsync(
            `
            DELETE FROM sync_queue

            WHERE id = ?
            `,
            [
                id,
            ]
        );
    };


// ============================================================
// Get Sync Queue
// ============================================================

export const getSyncQueue =
    async () => {

        const db =
            await getDatabase();


        return db.getAllAsync(
            `
            SELECT *
            FROM sync_queue
            ORDER BY created_at ASC
            `
        );
    };