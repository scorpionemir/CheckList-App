import React from "react";

import {
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import TableContainer from "./Table/TableContainer";
import TableHeader from "./Table/TableHeader";
import TableRow from "./Table/TableRow";
import TableLabel from "./Table/TableLabel";
import TableValue from "./Table/TableValue";


const SerialNumber = ({
    value = "",
    onChange,
}) => {

    return (
        <TableContainer>

            <TableHeader title="شماره سریال" />

            <TableRow>

                <TableLabel title="شماره سریال" />

                <TableValue>

                    <View style={styles.inputContainer}>

                        <Text style={styles.prefix}>
                            SN:
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={value}
                            onChangeText={onChange}
                            placeholder="شماره سریال"
                            placeholderTextColor="#999"
                        />

                    </View>

                </TableValue>

            </TableRow>

        </TableContainer>
    );
};


export default React.memo(SerialNumber);


const styles = StyleSheet.create({

    inputContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    prefix: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },

    input: {
        flex: 1,
        height: 45,
        borderWidth: 1,
        borderColor: "#999",
        borderRadius: 6,
        paddingHorizontal: 10,
        fontSize: 15,
        textAlign: "left",
        backgroundColor: "#FFFFFF",
    },

});