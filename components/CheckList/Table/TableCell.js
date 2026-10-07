import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TableCell = ({ label, children }) => {
    return (
        <View style={styles.container}>

            <Text style={styles.label}>
                {label}
            </Text>

            <View style={styles.content}>
                {children}
            </View>

        </View>
    );
};

export default TableCell;

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },

    label: {
        fontSize: 15,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 8,
    },

    content: {
        width: "100%",
    },
});