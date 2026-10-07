import * as SQLite from "expo-sqlite";

import {
    getSyncQueue,
} from "./localDatabase";


const DATABASE_NAME =
    "checklist_local.db";


/*
|--------------------------------------------------------------------------
| Runtime Sync State
|--------------------------------------------------------------------------
*/

let runtimeState = {
    isSyncing: false,

    lastSyncAt: null,

    lastSuccessAt: null,

    lastError: null,

    lastMessage: null,
};


const listeners =
    new Set();


/*
|--------------------------------------------------------------------------
| Notify Listeners
|--------------------------------------------------------------------------
*/

const notifyListeners = () => {

    const snapshot = {
        ...runtimeState,
    };

    listeners.forEach(
        (listener) => {

            try {

                listener(
                    snapshot
                );

            } catch (error) {

                console.error(
                    "Sync status listener error:",
                    error
                );

            }

        }
    );
};


/*
|--------------------------------------------------------------------------
| Subscribe
|--------------------------------------------------------------------------
*/

export const subscribeSyncStatus = (
    listener
) => {

    if (
        typeof listener !==
        "function"
    ) {
        return () => {};
    }

    listeners.add(
        listener
    );

    listener({
        ...runtimeState,
    });

    return () => {

        listeners.delete(
            listener
        );

    };
};


/*
|--------------------------------------------------------------------------
| Get Runtime State
|--------------------------------------------------------------------------
*/

export const getSyncRuntimeState = () => {

    return {
        ...runtimeState,
    };

};


/*
|--------------------------------------------------------------------------
| Set Runtime State
|--------------------------------------------------------------------------
*/

export const setSyncRuntimeState = (
    updates
) => {

    runtimeState = {
        ...runtimeState,
        ...updates,
    };

    notifyListeners();

};


/*
|--------------------------------------------------------------------------
| Queue Status
|--------------------------------------------------------------------------
*/

export const getSyncQueueStatus = async () => {

    try {

        const queue =
            await getSyncQueue();

        const safeQueue =
            Array.isArray(queue)
                ? queue
                : [];


        const pending =
            safeQueue.filter(
                (item) =>
                    item.status ===
                    "pending"
            ).length;


        const processing =
            safeQueue.filter(
                (item) =>
                    item.status ===
                    "processing"
            ).length;


        const failed =
            safeQueue.filter(
                (item) =>
                    item.status ===
                    "failed"
            ).length;


        const total =
            safeQueue.length;


        return {

            total,

            pending,

            processing,

            failed,

            items:
                safeQueue,

        };

    } catch (error) {

        console.error(
            "Get sync queue status error:",
            error
        );

        return {

            total: 0,

            pending: 0,

            processing: 0,

            failed: 0,

            items: [],

            error,

        };

    }

};


/*
|--------------------------------------------------------------------------
| Reset Failed Operations
|--------------------------------------------------------------------------
|
| این تابع برای Retry دستی است.
|
| retry_count دوباره صفر می‌شود تا Retry دستی
| از محدودیت Retry قبلی مستقل باشد.
|
*/

export const resetFailedSyncOperations =
    async () => {

        let db = null;

        try {

            db =
                await SQLite.openDatabaseAsync(
                    DATABASE_NAME
                );


            const now =
                new Date().toISOString();


            /*
            |--------------------------------------------------------------------------
            | بررسی وجود next_retry_at
            |--------------------------------------------------------------------------
            */

            const columns =
                await db.getAllAsync(
                    `
                    PRAGMA table_info(sync_queue)
                    `
                );


            const hasNextRetryAt =
                columns.some(
                    (column) =>
                        column.name ===
                        "next_retry_at"
                );


            if (hasNextRetryAt) {

                await db.runAsync(
                    `
                    UPDATE sync_queue

                    SET
                        status = 'pending',
                        retry_count = 0,
                        last_error = NULL,
                        next_retry_at = NULL,
                        updated_at = ?

                    WHERE status = 'failed'
                    `,
                    [
                        now,
                    ]
                );

            } else {

                await db.runAsync(
                    `
                    UPDATE sync_queue

                    SET
                        status = 'pending',
                        retry_count = 0,
                        last_error = NULL,
                        updated_at = ?

                    WHERE status = 'failed'
                    `,
                    [
                        now,
                    ]
                );

            }


            return true;

        } catch (error) {

            console.error(
                "Reset failed sync operations error:",
                error
            );

            throw error;

        } finally {

            try {

                await db?.closeAsync();

            } catch (error) {

                console.error(
                    "Close sync status database error:",
                    error
                );

            }

        }

    };