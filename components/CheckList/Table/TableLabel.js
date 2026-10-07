import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TableLabel = ({ title }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                {title}
            </Text>
        </View>
    );
};

export default TableLabel;

const styles = StyleSheet.create({
    container: {
        width: "35%",
        minHeight: 55,

        justifyContent: "center",
        alignItems: "flex-end",

        paddingHorizontal: 12,

        backgroundColor: "#F7F7F7",

        // خط جداکننده بین Label و Value
        borderLeftWidth: 1,
        borderLeftColor: "#333333",
    },

    text: {
        fontSize: 15,
        fontWeight: "600",
        textAlign: "right",
    },
});