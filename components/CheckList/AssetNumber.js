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


const AssetNumber = ({
    value = "",
    onChange,
}) => {

    return (
        <TableContainer>

            <TableHeader title="شماره اموال" />

            <TableRow>

                <TableLabel title="شماره اموال" />

                <TableValue>

                    <View style={styles.inputContainer}>

                        <Text style={styles.prefix}>
                            NO:
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={value}
                            onChangeText={onChange}
                            placeholder="شماره اموال"
                            placeholderTextColor="#999"
                        />

                    </View>

                </TableValue>

            </TableRow>

        </TableContainer>
    );
};


export default React.memo(AssetNumber);


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