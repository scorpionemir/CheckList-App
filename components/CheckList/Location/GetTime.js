import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const TimeInput = ({ value, onChange, title }) => {
    const [show, setShow] = useState(false);

    const handleChange = (event, selectedTime) => {
        setShow(false);

        if (selectedTime) {
            onChange(selectedTime);
        }
    };

    return (
        <View>
            <Text>{title}</Text>

            <Button
                title="انتخاب ساعت"
                onPress={() => setShow(true)}
            />

            <Text style={styles.timeText}>
                {value
                    ? value.toLocaleTimeString("fa-IR", {
                          hour: "2-digit",
                          minute: "2-digit",
                      })
                    : "ساعت انتخاب نشده"}
            </Text>

            {show && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="time"
                    is24Hour={true}
                    onValueChange={handleChange}
                />
            )}
        </View>
    );
};

export default TimeInput;

const styles = StyleSheet.create({
    timeText: {
        fontWeight: "bold",
        textAlign: "center",
        width: "100%",
        fontSize: 16,
    },
});