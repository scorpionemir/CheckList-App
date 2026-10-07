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
    getAllSubmittedChecklists,
    setChecklistEditPermission,
} from "../services/api";


const ANTENNA_CHECKLIST_TYPE_ID =
    "90286988-53d6-4a65-bd87-f5771fc95960";

const WIRELESS_CHECKLIST_TYPE_ID =
    "513e9202-7fb3-47a3-9f5b-ab8e1beb3ca0";


const ManagerChecklistArchive = ({
    navigation,
}) => {

    const [
        checklists,
        setChecklists,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const loadChecklists =
        async () => {

            try {

                setLoading(true);

                const response =
                    await getAllSubmittedChecklists();

                setChecklists(
                    response?.checklists ||
                        []
                );

            } catch (error) {

                console.error(
                    "Manager checklist load error:",
                    error
                );

                Alert.alert(
                    "خطا",
                    error?.message ||
                        "دریافت چک‌لیست‌ها انجام نشد."
                );

            } finally {

                setLoading(false);
            }
        };


    useFocusEffect(
        useCallback(() => {
            loadChecklists();
        }, [])
    );


    const handlePermission =
        async (
            item,
            allowed
        ) => {

            try {

                await setChecklistEditPermission(
                    item.id,
                    allowed
                );

                await loadChecklists();

                Alert.alert(
                    "انجام شد",
                    allowed
                        ? "مجوز ویرایش صادر شد."
                        : "مجوز ویرایش لغو شد."
                );

            } catch (error) {

                console.error(
                    "Edit permission error:",
                    error
                );

                Alert.alert(
                    "خطا",
                    error?.message ||
                        "تغییر مجوز ویرایش انجام نشد."
                );
            }
        };


    const getChecklistName =
        (
            typeId
        ) => {

            if (
                typeId ===
                ANTENNA_CHECKLIST_TYPE_ID
            ) {
                return "چک‌لیست دکل و آنتن";
            }

            if (
                typeId ===
                WIRELESS_CHECKLIST_TYPE_ID
            ) {
                return "چک‌لیست تجهیزات وایرلس";
            }

            return "چک‌لیست";
        };


    const renderItem =
        ({
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
                            navigation.navigate(
                                "ChecklistDetail",
                                {
                                    checklistId:
                                        item.id,
                                }
                            )
                        }
                    >

                        <Text
                            style={
                                styles.title
                            }
                        >
                            {item.site_name ||
                                "بدون نام سایت"}
                        </Text>

                        <View
                            style={
                                styles.row
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
                                    item.checklist_type_id
                                )}
                            </Text>
                        </View>

                        <View
                            style={
                                styles.row
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
                                {item.checklist_date ||
                                    "-"}
                            </Text>
                        </View>

                        <View
                            style={
                                styles.row
                            }
                        >
                            <Text
                                style={
                                    styles.label
                                }
                            >
                                وضعیت:
                            </Text>

                            <Text
                                style={
                                    item.edit_allowed
                                        ? styles.allowed
                                        : styles.locked
                                }
                            >
                                {item.edit_allowed
                                    ? "مجوز ویرایش فعال"
                                    : "ویرایش قفل است"}
                            </Text>
                        </View>

                    </TouchableOpacity>


                    <View
                        style={
                            styles.actions
                        }
                    >

                        <TouchableOpacity
                            style={
                                styles.allowButton
                            }
                            activeOpacity={0.8}
                            onPress={() =>
                                handlePermission(
                                    item,
                                    true
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.buttonText
                                }
                            >
                                اجازه ویرایش
                            </Text>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={
                                styles.revokeButton
                            }
                            activeOpacity={0.8}
                            onPress={() =>
                                handlePermission(
                                    item,
                                    false
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.revokeText
                                }
                            >
                                لغو مجوز
                            </Text>
                        </TouchableOpacity>

                    </View>

                </View>
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
                    در حال دریافت چک‌لیست‌ها...
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
                data={
                    checklists
                }

                keyExtractor={(
                    item
                ) =>
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
                            async () => {
                                try {
                                    setRefreshing(
                                        true
                                    );

                                    await loadChecklists();

                                } finally {
                                    setRefreshing(
                                        false
                                    );
                                }
                            }
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
                            چک‌لیستی وجود ندارد
                        </Text>
                    </View>
                }
            />

        </View>
    );
};


export default ManagerChecklistArchive;


const styles =
    StyleSheet.create({

        container: {
            flex: 1,
            backgroundColor:
                "#f5f5f5",
        },

        list: {
            padding: 15,
        },

        emptyContainer: {
            flexGrow: 1,
            justifyContent:
                "center",
            alignItems:
                "center",
            padding: 20,
        },

        emptyBox: {
            backgroundColor:
                "#ffffff",
            borderWidth: 1,
            borderColor:
                "#dddddd",
            borderRadius: 10,
            padding: 25,
        },

        emptyTitle: {
            fontSize: 17,
            fontWeight:
                "bold",
            color: "#555",
        },

        card: {
            backgroundColor:
                "#ffffff",
            borderWidth: 1,
            borderColor:
                "#dddddd",
            borderRadius: 10,
            padding: 15,
            marginBottom: 12,
        },

        title: {
            fontSize: 18,
            fontWeight:
                "bold",
            color: "#333",
            textAlign:
                "right",
            marginBottom: 12,
        },

        row: {
            flexDirection:
                "row",
            justifyContent:
                "space-between",
            marginBottom: 8,
        },

        label: {
            fontSize: 14,
            fontWeight:
                "bold",
            color: "#555",
        },

        value: {
            flex: 1,
            fontSize: 14,
            color: "#333",
            textAlign:
                "right",
            marginLeft: 10,
        },

        allowed: {
            flex: 1,
            color: "#1976d2",
            fontWeight:
                "bold",
            textAlign:
                "right",
        },

        locked: {
            flex: 1,
            color: "#777",
            fontWeight:
                "bold",
            textAlign:
                "right",
        },

        actions: {
            flexDirection:
                "row",
            gap: 10,
            marginTop: 12,
        },

        allowButton: {
            flex: 1,
            backgroundColor:
                "#1976d2",
            borderRadius: 8,
            paddingVertical: 12,
            alignItems:
                "center",
        },

        revokeButton: {
            flex: 1,
            borderWidth: 1,
            borderColor:
                "#c0392b",
            borderRadius: 8,
            paddingVertical: 12,
            alignItems:
                "center",
        },

        buttonText: {
            color: "#fff",
            fontWeight:
                "bold",
        },

        revokeText: {
            color: "#c0392b",
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
            color: "#555",
        },
    });