import React from "react";

import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import TableContainer from "./Table/TableContainer";
import TableHeader from "./Table/TableHeader";
import TableRow from "./Table/TableRow";
import TableLabel from "./Table/TableLabel";
import TableValue from "./Table/TableValue";

const EarthingSystem = ({ data, onChange }) => {

    const options = [
        "اکتیو",
        "میله ای",
    ];

    const handleSelect = (option) => {
        onChange("selectedOption", option);
    };

    return (
        <TableContainer>

            <TableHeader title="سیستم ارتینگ و صاعقه گیر" />

            {/* گزینه‌های وضعیت */}

            <TableRow>

                <TableLabel title="وضعیت" />

                <TableValue>

                    <View style={styles.checkboxContainer}>

                        {options.map((option) => {

                            const isSelected =
                                data.selectedOption === option;

                            return (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.checkboxOption}
                                    onPress={() =>
                                        handleSelect(option)
                                    }
                                    activeOpacity={0.7}
                                >

                                    <View
                                        style={[
                                            styles.checkbox,
                                            isSelected &&
                                                styles.checkboxSelected,
                                        ]}
                                    >
                                        {isSelected && (
                                            <Text style={styles.checkmark}>
                                                ✓
                                            </Text>
                                        )}
                                    </View>

                                    <Text style={styles.checkboxText}>
                                        {option}
                                    </Text>

                                </TouchableOpacity>
                            );
                        })}

                    </View>

                </TableValue>

            </TableRow>

            {/* توضیحات */}

            <TableRow>

                <TableLabel title="توضیحات" />

                <TableValue>

                    <TextInput
                        style={styles.descriptionInput}
                        value={data.description}
                        onChangeText={(value) =>
                            onChange("description", value)
                        }
                        placeholder="توضیحات را وارد کنید"
                        multiline
                        textAlign="right"
                        textAlignVertical="top"
                    />

                </TableValue>

            </TableRow>

        </TableContainer>
    );
};

export default React.memo(EarthingSystem);

const styles = StyleSheet.create({

    // ==========================
    // Checkbox Container
    // ==========================

    checkboxContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    // ==========================
    // Checkbox Option
    // ==========================

    checkboxOption: {
        width: "48%",
        minHeight: 45,
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "flex-start",
    },

    // ==========================
    // Checkbox
    // ==========================

    checkbox: {
        width: 23,
        height: 23,
        borderWidth: 2,
        borderColor: "#333333",
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },

    checkboxSelected: {
        backgroundColor: "#333333",
    },

    checkmark: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },

    // ==========================
    // Checkbox Text
    // ==========================

    checkboxText: {
        flex: 1,
        fontSize: 15,
        textAlign: "right",
    },

    // ==========================
    // Description
    // ==========================

    descriptionInput: { width: "100%", minHeight: 100, marginVertical: 10, borderWidth: 1, borderColor: "#999999", borderRadius: 8, backgroundColor: "#FFFFFF", fontSize: 15, paddingHorizontal: 12, paddingVertical: 12, textAlign: "right", textAlignVertical: "top", },
});