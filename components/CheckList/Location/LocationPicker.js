import React, {
    useMemo,
    useState,
} from "react";

import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    getProvincesList,
    getCities,
} from "@code-plate/iran-cities";

const LocationPicker = ({
    type,
    value,
    province,
    onChange,
    disabled = false,
}) => {
    const [visible, setVisible] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const provinces = useMemo(() => {
        return getProvincesList();
    }, []);

    const cities = useMemo(() => {
        if (!province) {
            return [];
        }

        const selectedProvince =
            provinces.find(
                (item) =>
                    item.fa === province
            );

        if (!selectedProvince) {
            return [];
        }

        return getCities(
            selectedProvince.en
        );
    }, [province, provinces]);

    const items =
        type === "province"
            ? provinces
            : cities;

    const filteredItems =
        useMemo(() => {
            const query =
                search.trim();

            if (!query) {
                return items;
            }

            return items.filter(
                (item) => {
                    const label =
                        type ===
                        "province"
                            ? item.fa
                            : typeof item ===
                                "string"
                              ? item
                              : item.fa;

                    return label.includes(
                        query
                    );
                }
            );
        }, [
            items,
            search,
            type,
        ]);

    const title =
        type === "province"
            ? "انتخاب استان"
            : "انتخاب شهر";

    const handleOpen = () => {
        setSearch("");
        setVisible(true);
    };

    const handleClose = () => {
        setSearch("");
        setVisible(false);
    };

    const handleSelect = (
        item
    ) => {
        if (type === "province") {
            onChange(item.fa);
        } else {
            const cityName =
                typeof item ===
                "string"
                    ? item
                    : item.fa;

            onChange(cityName);
        }

        handleClose();
    };

    return (
        <>
            <Pressable
                style={[
                    styles.input,
                    disabled &&
                        styles.disabled,
                ]}
                disabled={disabled}
                onPress={
                    handleOpen
                }
            >
                <Text
                    style={[
                        styles.inputText,
                        !value &&
                            styles.placeholder,
                    ]}
                >
                    {value ||
                        (type ===
                        "province"
                            ? "انتخاب استان"
                            : "انتخاب شهر")}
                </Text>
            </Pressable>

            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={
                    handleClose
                }
            >
                <View
                    style={
                        styles.overlay
                    }
                >
                    <View
                        style={
                            styles.modal
                        }
                    >
                        {/* Header */}
                        <View
                            style={
                                styles.header
                            }
                        >
                            <Text
                                style={
                                    styles.title
                                }
                            >
                                {title}
                            </Text>

                            <Pressable
                                onPress={
                                    handleClose
                            }
                            >
                                <Text
                                    style={
                                        styles.close
                                    }
                                >
                                    ×
                                </Text>
                            </Pressable>
                        </View>

                        {/* Search */}
                        <View
                            style={
                                styles.searchContainer
                            }
                        >
                            <TextInput
                                value={
                                    search
                                }
                                onChangeText={
                                    setSearch
                                }
                                placeholder={
                                    type ===
                                    "province"
                                        ? "جستجوی استان..."
                                        : "جستجوی شهر..."
                                }
                                placeholderTextColor="#888"
                                style={
                                    styles.searchInput
                                }
                                textAlign="right"
                                autoCorrect={
                                    false
                                }
                                autoCapitalize="none"
                            />
                        </View>

                        {/* List */}
                        <FlatList
                            data={
                                filteredItems
                            }
                            keyExtractor={(
                                item,
                                index
                            ) =>
                                type ===
                                "province"
                                    ? item.en
                                    : `${item}-${index}`
                            }
                            keyboardShouldPersistTaps="handled"
                            renderItem={({
                                item,
                            }) => {
                                const label =
                                    type ===
                                    "province"
                                        ? item.fa
                                        : typeof item ===
                                            "string"
                                          ? item
                                          : item.fa;

                                return (
                                    <Pressable
                                        style={
                                            styles.option
                                        }
                                        onPress={() =>
                                            handleSelect(
                                                item
                                            )
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.optionText
                                            }
                                        >
                                            {label}
                                        </Text>
                                    </Pressable>
                                );
                            }}
                            ListEmptyComponent={
                                <View
                                    style={
                                        styles.empty
                                    }
                                >
                                    <Text
                                        style={
                                            styles.emptyText
                                        }
                                    >
                                        موردی پیدا نشد
                                    </Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default LocationPicker;

const styles =
    StyleSheet.create({
        input: {
            width: "100%",
            minHeight: 45,
            justifyContent:
                "center",
            alignItems:
                "center",
            paddingHorizontal: 10,
        },

        disabled: {
            opacity: 0.5,
        },

        inputText: {
            fontSize: 16,
            textAlign: "center",
        },

        placeholder: {
            color: "#777",
        },

        overlay: {
            flex: 1,
            backgroundColor:
                "rgba(0,0,0,0.4)",
            justifyContent:
                "flex-end",
        },

        modal: {
            maxHeight: "80%",
            backgroundColor:
                "#ffffff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 20,
        },

        header: {
            minHeight: 60,
            flexDirection:
                "row",
            alignItems:
                "center",
            justifyContent:
                "space-between",
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor:
                "#ddd",
        },

        title: {
            flex: 1,
            fontSize: 18,
            fontWeight:
                "bold",
            textAlign:
                "center",
        },

        close: {
            fontSize: 32,
            lineHeight: 32,
        },

        searchContainer: {
            paddingHorizontal: 16,
            paddingVertical: 10,
        },

        searchInput: {
            minHeight: 45,
            borderWidth: 1,
            borderColor:
                "#cccccc",
            borderRadius: 10,
            paddingHorizontal: 12,
            fontSize: 16,
            textAlign: "right",
        },

        option: {
            minHeight: 50,
            justifyContent:
                "center",
            alignItems:
                "center",
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor:
                "#eeeeee",
        },

        optionText: {
            fontSize: 16,
            textAlign: "center",
        },

        empty: {
            padding: 30,
            alignItems:
                "center",
        },

        emptyText: {
            fontSize: 16,
            color: "#777",
        },
    });