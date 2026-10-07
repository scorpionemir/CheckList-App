import React from "react";
import { StyleSheet, View } from "react-native";

const TableValue = ({ children }) => {
    return (
        <View style={styles.container}>
            {children}
        </View>
    );
};

export default TableValue;

const styles = StyleSheet.create({
    container: {
        width: "65%",
        minHeight: 55,

        justifyContent: "center",

        paddingHorizontal: 10,

        backgroundColor: "#FFFFFF",
    },
});