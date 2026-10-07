import React from "react";
import { StyleSheet, View } from "react-native";

const TableRow = ({ children }) => {
    return (
        <View style={styles.row}>
            {children}
        </View>
    );
};

export default TableRow;

const styles = StyleSheet.create({
    row: {
        width: "100%",
        flexDirection: "row-reverse",

        borderBottomWidth: 1,
        borderBottomColor: "#333333",
    },
});