import React from "react";
import { StyleSheet, View } from "react-native";

const TableContainer = ({ children }) => {
    return (
        <View style={styles.container}>
            {children}
        </View>
    );
};

export default TableContainer;

const styles = StyleSheet.create({
    // container: {
    //     width: "100%",
    //     backgroundColor: "#FFFFFF",

    //     borderWidth: 1,
    //     borderColor: "#333333",
    //     borderRadius: 8,

    //     overflow: "hidden",
    //     marginBottom: 20,
    // },

    container: { 
        width: "100%", 
        backgroundColor: "#FFFFFF", 
        borderWidth: 1, 
        borderColor: "#333333", 
        borderRadius: 8, 
        overflow: "hidden", 
        marginBottom: 20, 
        //Shadow 
        shadowColor: "#000000", 
        shadowOffset: { width: 0, height: 3, }, 
        shadowOpacity: 0.15, 
        shadowRadius: 5, 
        //Android Shadow 
        elevation: 5 }
});