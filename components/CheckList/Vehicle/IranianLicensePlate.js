import React, {
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

const PLATE_LETTERS = [
    "الف",
    "ب",
    "پ",
    "ت",
    "ث",
    "ج",
    "چ",
    "ح",
    "خ",
    "د",
    "ذ",
    "ر",
    "ز",
    "ژ",
    "س",
    "ش",
    "ص",
    "ض",
    "ط",
    "ظ",
    "ع",
    "غ",
    "ف",
    "ق",
    "ک",
    "گ",
    "ل",
    "م",
    "ن",
    "و",
    "ه",
    "ی",
];

const IranianLicensePlate = ({
    data = {},
    onChange,
}) => {
    const [
        letterModalVisible,
        setLetterModalVisible,
    ] = useState(false);

    const handleNumberChange = (
        field,
        text,
        maxLength
    ) => {
        const value = text
            .replace(/[^0-9]/g, "")
            .slice(0, maxLength);

        onChange?.(field, value);
    };

    const handleLetterSelect = (letter) => {
        onChange?.("letter", letter);

        setLetterModalVisible(false);
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.plate}>
                {/* کد دو رقمی سمت راست */}
                <View
                    style={[
                        styles.numberSection,
                        styles.cityCodeSection,
                    ]}
                >
                    <TextInput
                        style={styles.numberInput}
                        value={
                            data?.cityCode ?? ""
                        }
                        onChangeText={(text) =>
                            handleNumberChange(
                                "cityCode",
                                text,
                                2
                            )
                        }
                        keyboardType="numeric"
                        maxLength={2}
                        placeholder="15"
                        placeholderTextColor="#999"
                    />
                </View>

                {/* جداکننده */}
                <View style={styles.verticalLine} />

                {/* سه رقم */}
                <View
                    style={[
                        styles.numberSection,
                        styles.threeNumberSection,
                    ]}
                >
                    <TextInput
                        style={styles.numberInput}
                        value={
                            data?.lastThreeNumbers ??
                            ""
                        }
                        onChangeText={(text) =>
                            handleNumberChange(
                                "lastThreeNumbers",
                                text,
                                3
                            )
                        }
                        keyboardType="numeric"
                        maxLength={3}
                        placeholder="287"
                        placeholderTextColor="#999"
                    />
                </View>

                {/* حرف */}
                <Pressable
                    style={styles.letterSection}
                    onPress={() =>
                        setLetterModalVisible(true)
                    }
                >
                    <Text
                        style={[
                            styles.letterText,
                            !data?.letter &&
                                styles.placeholderText,
                        ]}
                    >
                        {data?.letter || "ب"}
                    </Text>
                </Pressable>

                {/* دو رقم */}
                <View
                    style={[
                        styles.numberSection,
                        styles.firstNumberSection,
                    ]}
                >
                    <TextInput
                        style={styles.numberInput}
                        value={
                            data?.firstTwoNumbers ??
                            ""
                        }
                        onChangeText={(text) =>
                            handleNumberChange(
                                "firstTwoNumbers",
                                text,
                                2
                            )
                        }
                        keyboardType="numeric"
                        maxLength={2}
                        placeholder="12"
                        placeholderTextColor="#999"
                    />
                </View>

                {/* بخش آبی پلاک */}
                <View style={styles.blueSection}>
                    <Text style={styles.blueText}>
                        IR
                    </Text>

                    <Text style={styles.blueText}>
                        IRAN
                    </Text>
                </View>
            </View>

            <Modal
                visible={letterModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() =>
                    setLetterModalVisible(false)
                }
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalHeader}>
                            <Text
                                style={styles.modalTitle}
                            >
                                انتخاب حرف پلاک
                            </Text>

                            <Pressable
                                onPress={() =>
                                    setLetterModalVisible(
                                        false
                                    )
                                }
                            >
                                <Text
                                    style={
                                        styles.closeButton
                                    }
                                >
                                    ×
                                </Text>
                            </Pressable>
                        </View>

                        <FlatList
                            data={PLATE_LETTERS}
                            numColumns={4}
                            keyExtractor={(item) =>
                                item
                            }
                            contentContainerStyle={
                                styles.lettersContainer
                            }
                            renderItem={({ item }) => (
                                <Pressable
                                    style={[
                                        styles.letterOption,
                                        data?.letter ===
                                            item &&
                                            styles.selectedLetter,
                                    ]}
                                    onPress={() =>
                                        handleLetterSelect(
                                            item
                                        )
                                    }
                                >
                                    <Text
                                        style={
                                            styles.letterOptionText
                                        }
                                    >
                                        {item}
                                    </Text>
                                </Pressable>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default React.memo(
    IranianLicensePlate
);

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        alignItems: "center",
        paddingVertical: 8,
    },

    plate: {
        width: "100%",
        height: 58,

        flexDirection: "row",

        backgroundColor: "#ffffff",

        borderWidth: 1.5,
        borderColor: "#222222",
        borderRadius: 4,

        overflow: "hidden",
    },

    numberSection: {
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
    },

    cityCodeSection: {
        width: 42,
    },

    threeNumberSection: {
        flex: 1,
        minWidth: 55,
    },

    firstNumberSection: {
        width: 42,
    },

    numberInput: {
        width: "100%",
        height: "100%",

        padding: 0,
        margin: 0,

        fontSize: 18,
        fontWeight: "bold",

        color: "#111111",

        textAlign: "center",
    },

    letterSection: {
        width: 42,
        height: "100%",

        justifyContent: "center",
        alignItems: "center",

        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: "#222222",

        backgroundColor: "#ffffff",
    },

    letterText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111111",
    },

    placeholderText: {
        color: "#999999",
    },

    verticalLine: {
        width: 1,
        height: "100%",
        backgroundColor: "#222222",
    },

    blueSection: {
        width: 35,
        height: "100%",

        backgroundColor: "#174a9c",

        justifyContent: "center",
        alignItems: "center",
    },

    blueText: {
        color: "#ffffff",
        fontSize: 7,
        fontWeight: "bold",
        textAlign: "center",
    },

    modalOverlay: {
        flex: 1,

        backgroundColor:
            "rgba(0, 0, 0, 0.45)",

        justifyContent: "flex-end",
    },

    modal: {
        width: "100%",
        maxHeight: "70%",

        backgroundColor: "#ffffff",

        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,

        paddingBottom: 20,
    },

    modalHeader: {
        height: 60,

        flexDirection: "row",

        alignItems: "center",
        justifyContent: "space-between",

        paddingHorizontal: 20,

        borderBottomWidth: 1,
        borderBottomColor: "#dddddd",
    },

    modalTitle: {
        flex: 1,

        fontSize: 18,
        fontWeight: "bold",

        textAlign: "center",
    },

    closeButton: {
        fontSize: 30,
        color: "#333333",
    },

    lettersContainer: {
        padding: 10,
    },

    letterOption: {
        flex: 1,

        height: 55,

        margin: 5,

        borderWidth: 1,
        borderColor: "#cccccc",

        borderRadius: 8,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#ffffff",
    },

    selectedLetter: {
        borderWidth: 2,
        borderColor: "#174a9c",
        backgroundColor: "#eef4ff",
    },

    letterOptionText: {
        fontSize: 19,
        fontWeight: "bold",
    },
});