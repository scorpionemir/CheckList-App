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


const TowerTypeAndBase = ({ data, onChange }) => {

    const towerTypeOptions = [
        "مهاری 3 وجهی",
        "مهاری 4 وجهی",
        "خود ایستا",
    ];

    const towerBaseOptions = [
        "G25",
        "G35",
        "G45",
    ];


    const handleTowerTypeSelect = (option) => {

        onChange("towerType", option);

        if (option !== "خود ایستا") {
            onChange("baseDescription", null);
        }
    };


    const handleTowerBaseSelect = (option) => {
        onChange("baseType", option);
    };


    const isDescriptionEnabled =
        data.towerType === "خود ایستا";


    return (
        <>

            {/* ================================= */}
            {/* جدول ۷ - نوع دکل نصبی */}
            {/* ================================= */}

            <TableContainer>

                <TableHeader title="نوع دکل نصبی" />

                <TableRow>

                    <TableLabel title="نوع دکل" />

                    <TableValue>

                        <View style={styles.checkboxContainer}>

                            {towerTypeOptions.map((option) => {

                                const isSelected =
                                    data.towerType === option;

                                return (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.checkboxOption}
                                        onPress={() =>
                                            handleTowerTypeSelect(
                                                option
                                            )
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

            </TableContainer>


            {/* ================================= */}
            {/* جدول ۸ - قاعده دکل نصبی */}
            {/* ================================= */}

            <TableContainer>

                <TableHeader title="قاعده دکل نصبی" />

                {/* Checkbox ها */}
                <TableRow>

                    <TableLabel title="نوع قاعده" />

                    <TableValue>

                        <View style={styles.checkboxContainer}>

                            {towerBaseOptions.map((option) => {

                                const isSelected =
                                    data.baseType === option;

                                return (
                                    <TouchableOpacity
                                        key={option}
                                        style={
                                            styles.checkboxOption
                                        }
                                        onPress={() =>
                                            handleTowerBaseSelect(
                                                option
                                            )
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
                <TableRow> <TableLabel title="توضیحات" /> <TableValue> <View style={styles.descriptionContainer}> <TextInput style={[ styles.descriptionInput, !isDescriptionEnabled && styles.disabledInput, ]} value={data.baseDescription || ""} onChangeText={(value) => onChange("baseDescription", value) } placeholder={ isDescriptionEnabled ? "توضیحات را وارد کنید" : "این قسمت غیرفعال است" } placeholderTextColor="#999999" multiline textAlign="right" textAlignVertical="top" editable={isDescriptionEnabled} /> </View> </TableValue> </TableRow>

            </TableContainer>

        </>
    );
};


export default React.memo(TowerTypeAndBase);


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

    descriptionContainer: {
        width: "100%", paddingVertical: 10, paddingHorizontal: 8,
    },

    descriptionInput: { width: "100%", minHeight: 100, borderWidth: 1, borderColor: "#999999", borderRadius: 8, backgroundColor: "#FFFFFF", fontSize: 15, paddingHorizontal: 12, paddingVertical: 12, textAlign: "right", textAlignVertical: "top", }, 
    
    disabledInput: { backgroundColor: "#EEEEEE", borderColor: "#CCCCCC", color: "#999999", },

    

});