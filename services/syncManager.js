import * as Network from "expo-network";

import {
    createChecklist,
} from "./api";

import {
    getPendingSyncOperations,
    markSyncOperationProcessing,
    markSyncOperationRetry,
    markSyncOperationFailed,
    deleteSyncOperation,
    recoverStuckSyncOperations,
} from "./localDatabase";

import {
    classifySyncError,
} from "./syncErrorHandler";

import {
    setSyncRuntimeState,
} from "./syncStatus";


// ============================================================
// Sync Configuration
// ============================================================

let isSyncing = false;

let networkSubscription = null;

let syncTimeout = null;

let lastNetworkOnlineState = null;

const MAX_RETRIES = 5;

const RETRY_BASE_DELAY_MS = 5000;

const RETRY_MAX_DELAY_MS =
    5 * 60 * 1000;

const SYNC_DELAY_AFTER_NETWORK_RESTORE_MS = 1500;

const SYNC_BATCH_SIZE = 20;


// ============================================================
// Network Check
// ============================================================

const checkOnline = async () => {
    try {
        const state =
            await Network.getNetworkStateAsync();

        return (
            state?.isConnected === true &&
            state?.isInternetReachable !== false
        );
    } catch (error) {
        console.error(
            "Sync network check error:",
            error
        );

        return false;
    }
};


// ============================================================
// Schedule Sync
// ============================================================

const scheduleSync = (
    delay = SYNC_DELAY_AFTER_NETWORK_RESTORE_MS
) => {
    if (syncTimeout) {
        clearTimeout(syncTimeout);
    }

    syncTimeout = setTimeout(
        () => {
            syncTimeout = null;

            syncPendingOperations();
        },
        delay
    );
};


// ============================================================
// Sync Pending Operations
// ============================================================

export const syncPendingOperations =
    async () => {

        // --------------------------------------------------------
        // Prevent concurrent sync operations
        // --------------------------------------------------------

        if (isSyncing) {
            return;
        }


        // --------------------------------------------------------
        // Check Network
        // --------------------------------------------------------

        const online =
            await checkOnline();

        if (!online) {
            setSyncRuntimeState({
                lastMessage:
                    "دستگاه آفلاین است.",
            });

            return;
        }


        // --------------------------------------------------------
        // Lock Sync
        // --------------------------------------------------------

        isSyncing = true;

        setSyncRuntimeState({
            isSyncing: true,
            lastError: null,
            lastMessage:
                "در حال همگام‌سازی اطلاعات...",
        });


        try {

            // ====================================================
            // Crash Recovery
            // ====================================================

            await recoverStuckSyncOperations();


            // ====================================================
            // Get Pending Queue
            // ====================================================

            const operations =
                await getPendingSyncOperations(
                    SYNC_BATCH_SIZE
                );


            // ====================================================
            // Empty Queue
            // ====================================================

            if (
                !operations ||
                operations.length === 0
            ) {
                const finishedAt =
                    new Date().toISOString();

                setSyncRuntimeState({
                    isSyncing: false,
                    lastSyncAt:
                        finishedAt,
                    lastSuccessAt:
                        finishedAt,
                    lastError: null,
                    lastMessage:
                        "همگام‌سازی انجام شد.",
                });

                return;
            }


            // ====================================================
            // Process Queue
            // ====================================================

            for (
                const operation of operations
            ) {

                try {

                    // ------------------------------------------------
                    // Mark Processing
                    // ------------------------------------------------

                    await markSyncOperationProcessing(
                        operation.id
                    );


                    // ------------------------------------------------
                    // Create Checklist
                    // ------------------------------------------------

                    if (
                        operation.operationType ===
                        "create_checklist"
                    ) {

                        await createChecklist(
                            operation.payload,
                            {
                                skipQueue: true,

                                userId:
                                    operation.userId,

                                clientOperationId:
                                    operation.clientOperationId,
                            }
                        );


                        // --------------------------------------------
                        // Sync Successful
                        // --------------------------------------------

                        await deleteSyncOperation(
                            operation.id
                        );

                        continue;
                    }


                    // ------------------------------------------------
                    // Unsupported Operation
                    // ------------------------------------------------

                    throw new Error(
                        `Unsupported sync operation: ${operation.operationType}`
                    );

                } catch (error) {

                    console.error(
                        "Sync operation failed:",
                        operation.id,
                        error
                    );


                    // ================================================
                    // Classify Error
                    // ================================================

                    const classifiedError =
                        classifySyncError(
                            error
                        );


                    // ================================================
                    // Permanent Error
                    // ================================================

                    if (
                        classifiedError.permanent
                    ) {

                        await markSyncOperationFailed(
                            operation.id,
                            classifiedError.message
                        );

                        setSyncRuntimeState({
                            lastError:
                                classifiedError.message,

                            lastMessage:
                                classifiedError.message,
                        });

                        continue;
                    }


                    // ================================================
                    // Retryable Error
                    // ================================================

                    if (
                        classifiedError.retryable
                    ) {

                        const retryResult =
                            await markSyncOperationRetry(
                                operation.id,
                                classifiedError.message,
                                {
                                    maxRetries:
                                        MAX_RETRIES,

                                    baseDelayMs:
                                        RETRY_BASE_DELAY_MS,

                                    maxDelayMs:
                                        RETRY_MAX_DELAY_MS,
                                }
                            );


                        // --------------------------------------------
                        // Retry Limit Reached
                        // --------------------------------------------

                        if (
                            retryResult?.status ===
                            "failed"
                        ) {

                            setSyncRuntimeState({
                                lastError:
                                    classifiedError.message,

                                lastMessage:
                                    "ارسال اطلاعات پس از چند تلاش ناموفق متوقف شد.",
                            });

                            continue;
                        }


                        // --------------------------------------------
                        // Retry Scheduled
                        // --------------------------------------------

                        setSyncRuntimeState({
                            lastError:
                                classifiedError.message,

                            lastMessage:
                                "ارسال ناموفق بود؛ عملیات برای تلاش مجدد نگه داشته شد.",
                        });

                        continue;
                    }


                    // ================================================
                    // Safety Fallback
                    // ================================================

                    await markSyncOperationFailed(
                        operation.id,
                        classifiedError.message
                    );

                    setSyncRuntimeState({
                        lastError:
                            classifiedError.message,

                        lastMessage:
                            classifiedError.message,
                    });
                }
            }


            // ========================================================
            // Sync Finished
            // ========================================================

            const finishedAt =
                new Date().toISOString();

            setSyncRuntimeState({
                isSyncing: false,

                lastSyncAt:
                    finishedAt,

                lastSuccessAt:
                    finishedAt,

                lastMessage:
                    "همگام‌سازی به پایان رسید.",
            });

        } catch (error) {

            // ========================================================
            // Unexpected Sync Manager Error
            // ========================================================

            console.error(
                "Sync manager error:",
                error
            );

            setSyncRuntimeState({
                isSyncing: false,

                lastError:
                    error?.message ||
                    "خطای غیرمنتظره در همگام‌سازی.",

                lastMessage:
                    "همگام‌سازی با خطا مواجه شد.",
            });

        } finally {

            // ========================================================
            // Always Release Sync Lock
            // ========================================================

            isSyncing = false;
        }
    };


// ============================================================
// Network Listener
// ============================================================

export const startSyncListener =
    () => {

        // --------------------------------------------------------
        // Prevent Multiple Listeners
        // --------------------------------------------------------

        if (networkSubscription) {
            return () => {
                if (networkSubscription) {
                    networkSubscription.remove();
                    networkSubscription = null;
                }

                if (syncTimeout) {
                    clearTimeout(syncTimeout);
                    syncTimeout = null;
                }
            };
        }


        // --------------------------------------------------------
        // Initial Sync
        // --------------------------------------------------------

        syncPendingOperations();


        // --------------------------------------------------------
        // Network State Listener
        // --------------------------------------------------------

        networkSubscription =
            Network.addNetworkStateListener(
                (state) => {

                    const connected =
                        state?.isConnected === true;

                    const reachable =
                        state?.isInternetReachable !== false;

                    const isOnline =
                        connected &&
                        reachable;


                    // --------------------------------------------
                    // Ignore Duplicate Network States
                    // --------------------------------------------

                    if (
                        lastNetworkOnlineState ===
                        isOnline
                    ) {
                        return;
                    }


                    lastNetworkOnlineState =
                        isOnline;


                    // --------------------------------------------
                    // Network Restored
                    // --------------------------------------------

                    if (isOnline) {

                        setSyncRuntimeState({
                            lastMessage:
                                "اتصال اینترنت برقرار شد.",
                        });


                        scheduleSync(
                            SYNC_DELAY_AFTER_NETWORK_RESTORE_MS
                        );
                    }
                }
            );


        // --------------------------------------------------------
        // Cleanup
        // --------------------------------------------------------

        return () => {

            if (networkSubscription) {
                networkSubscription.remove();
                networkSubscription = null;
            }

            if (syncTimeout) {
                clearTimeout(syncTimeout);
                syncTimeout = null;
            }

            lastNetworkOnlineState =
                null;
        };
    };