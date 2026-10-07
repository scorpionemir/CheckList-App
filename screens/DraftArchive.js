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

import {
    useFocusEffect,
} from "@react-navigation/native";

import {
    deleteDraft,
    getDrafts,
} from "../services/localDatabase";

import { useAuth } from "../context/AuthContext";

const ANTENNA_CHECKLIST_TYPE_ID =
    "90286988-53d6-4a65-bd87-f5771fc95960";

const WIRELESS_CHECKLIST_TYPE_ID =
    "513e9202-7fb3-47a3-9f5b-ab8e1beb3ca0";

const DraftArchive = ({
    navigation,
}) => {
    const { user } = useAuth();

    const [drafts, setDrafts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const loadDrafts = async (
        showLoading = true
    ) => {
        try {
            if (!user?.id) {
                setDrafts([]);
                return;
            }

            if (showLoading) {
                setLoading(true);
            }

            const result =
                await getDrafts(user.id);

            setDrafts(result);
        } catch (error) {
            console.error(
                "Load drafts error:",
                error
            );

            Alert.alert(
                "خطا",
                "دریافت پیش‌نویس‌ها انجام نشد."
            );
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadDrafts();
        }, [user?.id])
    );

    const handleRefresh = async () => {
        try {
            setRefreshing(true);

            await loadDrafts(false);
        } finally {
            setRefreshing(false);
        }
    };

    const getChecklistName = (
        typeId
    ) => {
        if (
            typeId ===
            ANTENNA_CHECKLIST_TYPE_ID
        ) {
            return "چک لیست دکل و آنتن";
        }

        if (
            typeId ===
            WIRELESS_CHECKLIST_TYPE_ID
        ) {
            return "چک لیست تجهیزات وایرلس";
        }

        return "چک لیست";
    };

    const handleOpenDraft = (
        item
    ) => {
        /*
         * -----------------------------
         * Antenna Draft
         * -----------------------------
         */

        if (
            item.checklistTypeId ===
            ANTENNA_CHECKLIST_TYPE_ID
        ) {
            navigation.navigate(
                "CheckList",
                {
                    screen: "Antenna",

                    params: {
                        draftId: item.id,
                    },
                }
            );

            return;
        }

        /*
         * -----------------------------
         * Wireless Draft
         * -----------------------------
         */

        if (
            item.checklistTypeId ===
            WIRELESS_CHECKLIST_TYPE_ID
        ) {
            navigation.navigate(
                "CheckList",
                {
                    screen: "Wireless",

                    params: {
                        draftId: item.id,
                    },
                }
            );

            return;
        }

        /*
         * -----------------------------
         * Unknown Draft Type
         * -----------------------------
         */

        Alert.alert(
            "خطا",
            "نوع این پیش‌نویس مشخص نیست."
        );
    };

    const handleDeleteDraft = (
        item
    ) => {
        Alert.alert(
            "حذف پیش‌نویس",
            "آیا از حذف این پیش‌نویس اطمینان دارید؟",
            [
                {
                    text: "انصراف",
                    style: "cancel",
                },

                {
                    text: "حذف",
                    style: "destructive",

                    onPress: async () => {
                        try {
                            if (!user?.id) {
                                Alert.alert(
                                    "خطا",
                                    "اطلاعات کاربر پیدا نشد."
                                );

                                return;
                            }

                            await deleteDraft(
                                item.id,
                                user.id
                            );

                            await loadDrafts(
                                false
                            );

                            Alert.alert(
                                "حذف شد",
                                "پیش‌نویس با موفقیت حذف شد."
                            );
                        } catch (
                            error
                        ) {
                            console.error(
                                "Delete draft error:",
                                error
                            );

                            Alert.alert(
                                "خطا",
                                "حذف پیش‌نویس انجام نشد."
                            );
                        }
                    },
                },
            ]
        );
    };

    const renderDraft = ({
        item,
    }) => {
        return (
            <View
                style={
                    styles.card
                }
            >
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                        handleOpenDraft(
                            item
                        )
                    }
                >
                    <View
                        style={
                            styles.cardHeader
                        }
                    >
                        <Text
                            style={
                                styles.title
                            }
                        >
                            {item.siteName ||
                                "بدون نام سایت"}
                        </Text>
                    </View>

                    <View
                        style={
                            styles.infoRow
                        }
                    >
                        <Text
                            style={
                                styles.label
                            }
                        >
                            نوع:
                        </Text>

                        <Text
                            style={
                                styles.value
                            }
                        >
                            {getChecklistName(
                                item.checklistTypeId
                            )}
                        </Text>
                    </View>

                    <View
                        style={
                            styles.infoRow
                        }
                    >
                        <Text
                            style={
                                styles.label
                            }
                        >
                            تاریخ:
                        </Text>

                        <Text
                            style={
                                styles.value
                            }
                        >
                            {item.checklistDate ||
                                "ثبت نشده"}
                        </Text>
                    </View>

                    <View
                        style={
                            styles.infoRow
                        }
                    >
                        <Text
                            style={
                                styles.label
                            }
                        >
                            آخرین تغییر:
                        </Text>

                        <Text
                            style={
                                styles.value
                            }
                        >
                            {new Date(
                                item.updatedAt
                            ).toLocaleString(
                                "fa-IR"
                            )}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={
                        styles.deleteButton
                    }
                    activeOpacity={0.7}
                    onPress={() =>
                        handleDeleteDraft(
                            item
                        )
                    }
                >
                    <Text
                        style={
                            styles.deleteText
                        }
                    >
                        حذف پیش‌نویس
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View
                style={
                    styles.centerContainer
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
                    در حال دریافت پیش‌نویس‌ها...
                </Text>
            </View>
        );
    }

    return (
        <View
            style={
                styles.container
            }
        >
            <FlatList
                data={drafts}
                keyExtractor={(item) =>
                    item.id
                }
                renderItem={
                    renderDraft
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
                    drafts.length === 0
                        ? styles.emptyContainer
                        : styles.listContainer
                }
                ListEmptyComponent={
                    <View
                        style={
                            styles.emptyBox
                        }
                    >
                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            پیش‌نویسی وجود ندارد
                        </Text>

                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            بعد از ذخیره یک
                            چک‌لیست به صورت
                            پیش‌نویس، اینجا
                            نمایش داده می‌شود.
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

export default DraftArchive;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },

    listContainer: {
        padding: 15,
    },

    emptyContainer: {
        flexGrow: 1,
        justifyContent:
            "center",
        alignItems: "center",
        padding: 20,
    },

    emptyBox: {
        width: "100%",
        padding: 25,
        borderRadius: 10,
        backgroundColor:
            "#ffffff",
        borderWidth: 1,
        borderColor: "#dddddd",
        alignItems: "center",
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333333",
        marginBottom: 10,
    },

    emptyText: {
        fontSize: 15,
        color: "#666666",
        textAlign: "center",
        lineHeight: 24,
    },

    card: {
        backgroundColor:
            "#ffffff",
        borderWidth: 1,
        borderColor: "#dddddd",
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
    },

    cardHeader: {
        borderBottomWidth: 1,
        borderBottomColor:
            "#eeeeee",
        paddingBottom: 10,
        marginBottom: 10,
    },

    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333333",
        textAlign: "right",
    },

    infoRow: {
        flexDirection: "row",
        justifyContent:
            "space-between",
        marginBottom: 8,
    },

    label: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#555555",
    },

    value: {
        fontSize: 14,
        color: "#333333",
        flex: 1,
        textAlign: "right",
        marginLeft: 10,
    },

    deleteButton: {
        marginTop: 10,
        minHeight: 42,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#c0392b",
        justifyContent:
            "center",
        alignItems: "center",
    },

    deleteText: {
        color: "#c0392b",
        fontSize: 15,
        fontWeight: "bold",
    },

    centerContainer: {
        flex: 1,
        justifyContent:
            "center",
        alignItems: "center",
    },

    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: "#555555",
    },
});