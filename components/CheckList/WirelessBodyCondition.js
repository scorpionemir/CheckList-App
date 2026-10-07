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


const WirelessBodyCondition = ({
    data = {
        selectedOptions: [],
        description: "",
    },
    onChange,
}) => {

    const options = [
        "سالم",
        "شکستگی",
        "ال سی دی شکسته",
    ];


    const handleSelect = (option) => {

        const currentOptions =
            data.selectedOptions || [];

        let newOptions;

        if (currentOptions.includes(option)) {

            newOptions = currentOptions.filter(
                (item) => item !== option
            );

        } else {

            newOptions = [
                ...currentOptions,
                option,
            ];

        }

        onChange(
            "selectedOptions",
            newOptions
        );
    };


    return (
        <TableContainer>

            <TableHeader title="وضعیت ظاهری و بدنه" />


            {/* وضعیت */}

            <TableRow>

                <TableLabel title="وضعیت" />

                <TableValue>

                    <View style={styles.checkboxContainer}>

                        {options.map((option) => {

                            const isSelected =
                                data.selectedOptions.includes(
                                    option
                                );

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
                                            <Text
                                                style={
                                                    styles.checkmark
                                                }
                                            >
                                                ✓
                                            </Text>
                                        )}

                                    </View>

                                    <Text
                                        style={
                                            styles.checkboxText
                                        }
                                    >
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
                            onChange(
                                "description",
                                value
                            )
                        }
                        placeholder="توضیحات را وارد کنید"
                        placeholderTextColor="#999"
                        multiline
                        textAlignVertical="top"
                    />

                </TableValue>

            </TableRow>

        </TableContainer>
    );
};


export default React.memo(WirelessBodyCondition);


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

    descriptionInput: { width: "100%", minHeight: 100, marginVertical: 10, borderWidth: 1, borderColor: "#999999", borderRadius: 8, backgroundColor: "#FFFFFF", fontSize: 15, paddingHorizontal: 12, paddingVertical: 12, textAlign: "right", textAlignVertical: "top", },

});