import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TableHeader = ({ title }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {title}
            </Text>
        </View>
    );
};

export default TableHeader;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingVertical: 14,
        paddingHorizontal: 12,

        backgroundColor: "#EDEDED",

        borderBottomWidth: 1,
        borderBottomColor: "#333333",
    },

    title: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
});