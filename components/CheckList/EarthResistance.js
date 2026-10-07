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

const EarthResistance = ({ data, onChange }) => {

    const options = [
        "آب ریز دارد",
        "آب ریز ندارد",
    ];

    const handleSelect = (option) => {
        onChange("selectedOption", option);
    };

    return (
        <TableContainer>

            <TableHeader title="وضعیت اهم چاه ارت" />

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

            {/* مقدار اهم */}

            <TableRow>

                <TableLabel title="مقدار اهم" />

                <TableValue>

                    <View style={styles.ohmContainer}>

                        <TextInput
                            style={styles.ohmInput}
                            value={data.ohmValue}
                            onChangeText={(value) =>
                                onChange("ohmValue", value)
                            }
                            keyboardType="numeric"
                            placeholder="مقدار را وارد کنید"
                            maxLength={10}
                        />

                        <Text style={styles.ohmSymbol}>
                            Ω
                        </Text>

                    </View>

                </TableValue>

            </TableRow>

        </TableContainer>
    );
};

export default React.memo(EarthResistance);

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
    // Ohm Input
    // ==========================

    ohmContainer: {
        width: "100%",
        minHeight: 45,
        flexDirection: "row-reverse",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#999999",
        borderRadius: 6,
        paddingHorizontal: 10,
    },

    ohmInput: {
        flex: 1,
        minHeight: 43,
        fontSize: 16,
        textAlign: "center",
    },

    ohmSymbol: {
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 8,
    },
});