import React, {
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    getSyncQueueStatus,
    getSyncRuntimeState,
    resetFailedSyncOperations,
    subscribeSyncStatus,
} from "../services/syncStatus";

import {
    syncPendingOperations,
} from "../services/syncManager";


const SyncStatusBar = () => {

    const [
        runtimeState,
        setRuntimeState,
    ] = useState(
        getSyncRuntimeState()
    );


    const [
        queueStatus,
        setQueueStatus,
    ] = useState({

        total: 0,

        pending: 0,

        processing: 0,

        failed: 0,

        items: [],

    });


    const [
        retrying,
        setRetrying,
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | Load Queue Status
    |--------------------------------------------------------------------------
    */

    const loadQueueStatus =
        async () => {

            try {

                const result =
                    await getSyncQueueStatus();


                setQueueStatus(
                    result
                );

            } catch (error) {

                console.error(
                    "Sync status queue error:",
                    error
                );

            }

        };


    /*
    |--------------------------------------------------------------------------
    | Subscribe To Runtime Status
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const unsubscribe =
            subscribeSyncStatus(
                (state) => {

                    setRuntimeState(
                        state
                    );

                }
            );


        loadQueueStatus();


        const interval =
            setInterval(
                () => {

                    loadQueueStatus();

                },
                1500
            );


        return () => {

            unsubscribe();

            clearInterval(
                interval
            );

        };

    }, []);


    /*
    |--------------------------------------------------------------------------
    | Manual Retry
    |--------------------------------------------------------------------------
    */

    const handleRetry =
        async () => {

            if (retrying) {
                return;
            }


            try {

                setRetrying(
                    true
                );


                await resetFailedSyncOperations();


                await loadQueueStatus();


                await syncPendingOperations();


                await loadQueueStatus();

            } catch (error) {

                console.error(
                    "Manual sync retry error:",
                    error
                );

            } finally {

                setRetrying(
                    false
                );

            }

        };


    /*
    |--------------------------------------------------------------------------
    | Determine Visibility
    |--------------------------------------------------------------------------
    */

    const shouldShow =
        runtimeState.isSyncing ||
        queueStatus.pending > 0 ||
        queueStatus.processing > 0 ||
        queueStatus.failed > 0 ||
        runtimeState.lastError;


    if (!shouldShow) {

        return null;

    }


    /*
    |--------------------------------------------------------------------------
    | Syncing
    |--------------------------------------------------------------------------
    */

    if (
        runtimeState.isSyncing ||
        queueStatus.processing > 0
    ) {

        return (

            <View
                style={[
                    styles.container,
                    styles.syncingContainer,
                ]}
            >

                <ActivityIndicator
                    size="small"
                    color="#ffffff"
                />

                <View
                    style={styles.textContainer}
                >

                    <Text
                        style={styles.title}
                    >
                        در حال همگام‌سازی
                    </Text>


                    <Text
                        style={styles.subtitle}
                    >
                        {queueStatus.pending > 0
                            ? `${queueStatus.pending} عملیات در صف`
                            : "در حال ارسال اطلاعات..."}
                    </Text>

                </View>

            </View>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Failed
    |--------------------------------------------------------------------------
    */

    if (
        queueStatus.failed > 0
    ) {

        return (

            <View
                style={[
                    styles.container,
                    styles.failedContainer,
                ]}
            >

                <View
                    style={styles.textContainer}
                >

                    <Text
                        style={styles.title}
                    >
                        خطا در همگام‌سازی
                    </Text>


                    <Text
                        style={styles.subtitle}
                    >
                        {queueStatus.failed}
                        {" "}
                        عملیات ارسال نشده است.
                    </Text>

                </View>


                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={
                        handleRetry
                    }
                    disabled={
                        retrying
                    }
                    activeOpacity={0.7}
                >

                    {retrying ? (

                        <ActivityIndicator
                            size="small"
                            color="#ffffff"
                        />

                    ) : (

                        <Text
                            style={styles.retryText}
                        >
                            تلاش مجدد
                        </Text>

                    )}

                </TouchableOpacity>

            </View>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Pending
    |--------------------------------------------------------------------------
    */

    if (
        queueStatus.pending > 0
    ) {

        return (

            <View
                style={[
                    styles.container,
                    styles.pendingContainer,
                ]}
            >

                <View
                    style={styles.textContainer}
                >

                    <Text
                        style={styles.title}
                    >
                        اطلاعات منتظر ارسال
                    </Text>


                    <Text
                        style={styles.subtitle}
                    >
                        {queueStatus.pending}
                        {" "}
                        عملیات در صف همگام‌سازی است.
                    </Text>

                </View>


                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={
                        syncPendingOperations
                    }
                    activeOpacity={0.7}
                >

                    <Text
                        style={styles.retryText}
                    >
                        همگام‌سازی
                    </Text>

                </TouchableOpacity>

            </View>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Default
    |--------------------------------------------------------------------------
    */

    return null;

};


export default SyncStatusBar;


const styles =
    StyleSheet.create({

        container: {

            width: "100%",

            minHeight: 52,

            paddingHorizontal: 14,

            paddingVertical: 9,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            direction:
                "rtl",

        },


        syncingContainer: {

            backgroundColor:
                "#2563eb",

        },


        pendingContainer: {

            backgroundColor:
                "#d97706",

        },


        failedContainer: {

            backgroundColor:
                "#dc2626",

        },


        textContainer: {

            flex: 1,

            marginHorizontal: 10,

        },


        title: {

            color:
                "#ffffff",

            fontSize: 14,

            fontWeight:
                "700",

            textAlign:
                "right",

        },


        subtitle: {

            color:
                "#ffffff",

            fontSize: 12,

            marginTop: 2,

            textAlign:
                "right",

        },


        retryButton: {

            minWidth: 82,

            minHeight: 34,

            paddingHorizontal: 12,

            borderRadius: 7,

            backgroundColor:
                "rgba(0,0,0,0.20)",

            alignItems:
                "center",

            justifyContent:
                "center",

        },


        retryText: {

            color:
                "#ffffff",

            fontSize: 12,

            fontWeight:
                "700",

        },

    });