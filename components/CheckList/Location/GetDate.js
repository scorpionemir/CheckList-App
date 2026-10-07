import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { toJalaali } from "jalaali-js";

const DateInput = ({ value, onChange }) => {
    const [show, setShow] = useState(false);

    const handleChange = (event, selectedDate) => {
        setShow(false);

        if (selectedDate) {
            onChange(selectedDate);
        }
    };

    const getJalaliDate = () => {
        if (!value) {
            return "تاریخ انتخاب نشده";
        }

        const { jy, jm, jd } = toJalaali(
            value.getFullYear(),
            value.getMonth() + 1,
            value.getDate()
        );

        return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
    };

    return (
        <View style={{ width: "100%", marginTop: 20}}>
            <Button
                title="انتخاب تاریخ"
                onPress={() => setShow(true)}
            />

            <Text style={styles.dateText}>
            {getJalaliDate()}
            </Text>

            {show && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    onValueChange={handleChange}
                />
            )}
        </View>
    );
};

export default DateInput;

const styles = StyleSheet.create({
    dateText: {
        fontWeight: "bold",
        textAlign: "center",
        width: "100%",
        fontSize: 16,
    },
});