import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const CheckboxGroup = ({ options, value, onChange }) => {
    const handleSelect = (option) => {
        onChange(option);
    };

    return (
        <View style={styles.container}>
            {options.map((option) => {
                const isSelected = value === option;

                return (
                    <Pressable
                        key={option}
                        style={styles.option}
                        onPress={() => handleSelect(option)}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                isSelected && styles.checkboxSelected,
                            ]}
                        >
                            {isSelected && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </View>

                        <Text style={styles.label}>{option}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

export default CheckboxGroup;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        gap: 12,
    },

    option: {
        width: "100%",
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 8,
    },

    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: "#333333",
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
    },

    checkboxSelected: {
        backgroundColor: "#333333",
    },

    checkmark: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "bold",
        lineHeight: 20,
    },

    label: {
        fontSize: 16,
        textAlign: "right",
    },
});