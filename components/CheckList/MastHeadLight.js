import React from "react";

import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import TableContainer from "./Table/TableContainer";
import TableHeader from "./Table/TableHeader";
import TableRow from "./Table/TableRow";
import TableLabel from "./Table/TableLabel";
import TableValue from "./Table/TableValue";

const MastHeadLight = ({ data, onChange }) => {

    const options = [
        "چراغ ندارد",
        "برق شهری",
        "خورشیدی",
        "سالم",
        "نیاز به تعویض",
    ];

    const handleSelect = (option) => {

        const currentOptions = data.selectedOptions || [];

        let updatedOptions;

        if (currentOptions.includes(option)) {
            updatedOptions = currentOptions.filter(
                (item) => item !== option
            );
        } else {
            updatedOptions = [
                ...currentOptions,
                option,
            ];
        }

        onChange(
            "selectedOptions",
            updatedOptions
        );
    };

    return (
        <TableContainer>

            <TableHeader title="چراغ سر دکل" />

            <TableRow>

                <TableLabel title="وضعیت" />

                <TableValue>

                    <View style={styles.checkboxContainer}>

                        {options.map((option) => {

                            const isSelected =
                                (data.selectedOptions || [])
                                    .includes(option);

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

        </TableContainer>
    );
};

export default React.memo(MastHeadLight);

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
});