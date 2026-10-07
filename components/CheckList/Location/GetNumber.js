import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

const NumberInput = ({ value, onChange, title }) => {
    return (
        <View>
            <Text>{title}</Text>

            <TextInput
              style={styles.numberInput}
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              placeholder="بازدید دوره ای"
            />
        </View>
    );
};

export default NumberInput;

const styles = StyleSheet.create({
    numberInput: {
        width: "100%",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 16,
    },
});