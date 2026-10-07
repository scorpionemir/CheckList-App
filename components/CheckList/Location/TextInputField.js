import React from "react";
import { StyleSheet, TextInput } from "react-native";

const TextInputField = ({ value, onChange }) => {
    return (
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            textAlign="center"
        />
    );
};

export default TextInputField;

const styles = StyleSheet.create({
    // input: {
    //     width: "100%",
    //     minHeight: 45,
    //     fontSize: 16,
    //     textAlign: "center",
    // },

    input: { 
        width: "100%", 
        minHeight: 80, 
        fontSize: 16, 
        textAlign: "center", 
        paddingHorizontal: 12, 
        paddingVertical: 12, 
        textAlignVertical: "top",
     }
});