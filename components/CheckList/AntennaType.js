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

const AntennaType = ({ data, onChange }) => {
    const options = [
        "4 دایپل 6 دیبی",
        "امنی",
        "یاگی",
        "ماکروویو 1",
        "ماکروویو 2",
        "ماکروویو 3",
        "ماکروویو 4",
    ];

    const handleSelect = (option) => {
        onChange("antennaType", option);
    };

    const handleHeightChange = (index, value) => {
        const heights = [...(data.heights || [])];
        heights[index] = value;
        onChange("heights", heights);
    };

    return (
        <TableContainer>
            <TableHeader title="نوع آنتن‌های نصبی روی دکل و ارتفاع آن‌ها" />

            <TableRow>
                <TableLabel title="نوع آنتن" />

                <TableValue>
                    <View style={styles.checkboxContainer}>
                        {options.map((option) => {
                            const isSelected = data.antennaType === option;

                            return (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.checkboxOption}
                                    onPress={() => handleSelect(option)}
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

            <TableRow> <TableLabel title="ارتفاع نصب" /> <TableValue> <View style={styles.heightContainer}> {[0, 1, 2, 3].map((index) => ( <View key={index} style={styles.heightItem}> <TextInput style={styles.heightInput} value={data.heights?.[index] || ""} onChangeText={(value) => handleHeightChange(index, value) } keyboardType="numeric" maxLength={10} textAlign="center" /> </View> ))} </View> </TableValue> </TableRow>

            <TableRow>
                <TableLabel title="توضیحات" />

                <TableValue>
                    <View style={styles.descriptionContainer}>
                        <TextInput
                            style={styles.descriptionInput}
                            value={data.description || ""}
                            onChangeText={(value) =>
                                onChange("description", value)
                            }
                            placeholder="توضیحات را وارد کنید"
                            placeholderTextColor="#999999"
                            multiline
                            textAlign="right"
                            textAlignVertical="top"
                        />
                    </View>
                </TableValue>
            </TableRow>
        </TableContainer>
    );
};

export default React.memo(AntennaType);

const styles = StyleSheet.create({
    checkboxContainer: {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    checkboxOption: {
        width: "48%",
        minHeight: 45,
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "flex-start",
        marginBottom: 10,
    },

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

    checkboxText: {
        flex: 1,
        fontSize: 15,
        textAlign: "right",
    },

    heightContainer: { width: "100%", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingVertical: 8, paddingHorizontal: 4, }, 
    
    heightItem: { width: "48%", marginBottom: 12, }, 
    
    heightInput: { width: "100%", height: 48, borderWidth: 1, borderColor: "#999999", borderRadius: 8, backgroundColor: "#FFFFFF", fontSize: 15, paddingHorizontal: 8, paddingVertical: 0, textAlign: "center", },

    descriptionContainer: { width: "100%", paddingVertical: 10, paddingHorizontal: 8, },

    descriptionInput: {
        width: "100%",
        minHeight: 90,
        borderWidth: 1,
        borderColor: "#999999",
        borderRadius: 6,
        backgroundColor: "#FFFFFF",
        fontSize: 15,
        paddingHorizontal: 12,
        paddingVertical: 12,
        textAlign: "right",
        textAlignVertical: "top",
    },
});