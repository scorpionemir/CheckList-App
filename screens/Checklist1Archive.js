import React, {
    useCallback,
    useState,
} from "react";

import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import {
    ApiError,
    getMyChecklistsByType,
} from "../services/api";

import { useAuth } from "../context/AuthContext";

const ANTENNA_CHECKLIST_TYPE_ID =
    "90286988-53d6-4a65-bd87-f5771fc95960";

const Checklist1Archive = ({
    navigation,
}) => {
    const [checklists, setChecklists] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const {
        handleSessionExpired,
    } = useAuth();

    const loadChecklists =
        useCallback(
            async (
                showLoading = true
            ) => {
                try {
                    if (showLoading) {
                        setLoading(true);
                    }

                    const response =
                        await getMyChecklistsByType(
                            ANTENNA_CHECKLIST_TYPE_ID
                        );

                    setChecklists(
                        response?.checklists ||
                            []
                    );
                } catch (error) {
                    console.error(
                        "Checklist 1 archive error:",
                        error
                    );

                    if (
                        error instanceof
                            ApiError &&
                        error.status ===
                            401
                    ) {
                        await handleSessionExpired();
                        return;
                    }

                    Alert.alert(
                        "خطا",
                        error?.message ||
                            "دریافت آرشیو انجام نشد."
                    );
                } finally {
                    setLoading(false);
                    setRefreshing(false);
                }
            },
            [
                handleSessionExpired,
            ]
        );

    useFocusEffect(
        useCallback(() => {
            loadChecklists();
        }, [loadChecklists])
    );

    const handleRefresh =
        async () => {
            setRefreshing(true);

            await loadChecklists(false);
        };

    const renderItem = ({
        item,
    }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() =>
                    navigation.navigate(
                        "ChecklistDetail",
                        {
                            checklistId:
                                item.id,
                        }
                    )
                }
            >
                <View
                    style={styles.row}
                >
                    <Text
                        style={
                            styles.label
                        }
                    >
                        تاریخ
                    </Text>

                    <Text
                        style={
                            styles.value
                        }
                    >
                        {formatDate(
                            item.checklist_date
                        )}
                    </Text>
                </View>

                <View
                    style={styles.row}
                >
                    <Text
                        style={
                            styles.label
                        }
                    >
                        سایت
                    </Text>

                    <Text
                        style={
                            styles.value
                        }
                    >
                        {item.site_name ||
                            "-"}
                    </Text>
                </View>

                <View
                    style={styles.row}
                >
                    <Text
                        style={
                            styles.label
                        }
                    >
                        وضعیت
                    </Text>

                    <Text
                        style={
                            item.edit_allowed
                                ? styles.editAllowed
                                : styles.status
                        }
                    >
                        {item.edit_allowed
                            ? "مجوز ویرایش فعال است"
                            : "ویرایش قفل است"}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View
                style={
                    styles.center
                }
            >
                <ActivityIndicator
                    size="large"
                    color="#c5882d"
                />

                <Text
                    style={
                        styles.loadingText
                    }
                >
                    در حال دریافت آرشیو...
                </Text>
            </View>
        );
    }

    return (
        <View
            style={styles.container}
        >
            <FlatList
                data={checklists}
                keyExtractor={(item) =>
                    item.id
                }
                renderItem={
                    renderItem
                }
                refreshControl={
                    <RefreshControl
                        refreshing={
                            refreshing
                        }
                        onRefresh={
                            handleRefresh
                        }
                    />
                }
                contentContainerStyle={
                    checklists.length ===
                    0
                        ? styles.emptyContainer
                        : styles.list
                }
                ListEmptyComponent={
                    <Text
                        style={
                            styles.emptyText
                        }
                    >
                        هنوز چک لیستی ثبت نشده است.
                    </Text>
                }
            />
        </View>
    );
};

const formatDate = (
    date
) => {
    if (!date) {
        return "-";
    }

    const value =
        String(date);

    if (
        value.includes("T")
    ) {
        return value.split(
            "T"
        )[0];
    }

    return value;
};

export default Checklist1Archive;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },

    list: {
        padding: 16,
    },

    emptyContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    card: {
        backgroundColor:
            "#ffffff",
        borderWidth: 1,
        borderColor: "#dddddd",
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
    },

    row: {
        flexDirection:
            "row-reverse",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor:
            "#eeeeee",
    },

    label: {
        width: "30%",
        fontWeight:
            "bold",
        textAlign:
            "right",
        color: "#555555",
    },

    value: {
        flex: 1,
        textAlign:
            "left",
        color: "#222222",
    },

    status: {
        flex: 1,
        textAlign:
            "left",
        color: "#388e3c",
        fontWeight:
            "bold",
    },

    center: {
        flex: 1,
        justifyContent:
            "center",
        alignItems:
            "center",
    },

    loadingText: {
        marginTop: 12,
        color: "#555555",
    },

    emptyText: {
        fontSize: 16,
        color: "#777777",
        textAlign:
            "center",
    },
    editAllowed: {
    flex: 1,
    textAlign: "left",
    color: "#1976d2",
    fontWeight: "bold",
},
});