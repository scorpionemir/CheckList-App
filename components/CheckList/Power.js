import React from "react";

import {
    StyleSheet,
    TextInput,
} from "react-native";

import TableContainer from "./Table/TableContainer";
import TableHeader from "./Table/TableHeader";
import TableRow from "./Table/TableRow";
import TableLabel from "./Table/TableLabel";
import TableValue from "./Table/TableValue";


const Power = ({
    data = {
        outputPower: "",
        returnPower: "",
        vswr: "",
    },
    onChange,
}) => {

    return (
        <TableContainer>

            <TableHeader title="توان" />


            {/* توان خروجی */}

            <TableRow>

                <TableLabel title="توان خروجی" />

                <TableValue>

                    <TextInput
                        style={styles.input}
                        value={data.outputPower}
                        onChangeText={(value) =>
                            onChange(
                                "outputPower",
                                value
                            )
                        }
                        keyboardType="numeric"
                        placeholder="مقدار را وارد کنید"
                        placeholderTextColor="#999"
                    />

                </TableValue>

            </TableRow>


            {/* توان برگشتی */}

            <TableRow>

                <TableLabel title="توان برگشتی" />

                <TableValue>

                    <TextInput
                        style={styles.input}
                        value={data.returnPower}
                        onChangeText={(value) =>
                            onChange(
                                "returnPower",
                                value
                            )
                        }
                        keyboardType="numeric"
                        placeholder="مقدار را وارد کنید"
                        placeholderTextColor="#999"
                    />

                </TableValue>

            </TableRow>


            {/* VSWR */}

            <TableRow>

                <TableLabel title="VSWR" />

                <TableValue>

                    <TextInput
                        style={styles.input}
                        value={data.vswr}
                        onChangeText={(value) =>
                            onChange(
                                "vswr",
                                value
                            )
                        }
                        keyboardType="numeric"
                        placeholder="مقدار را وارد کنید"
                        placeholderTextColor="#999"
                    />

                </TableValue>

            </TableRow>

        </TableContainer>
    );
};


export default React.memo(Power);


const styles = StyleSheet.create({

    input: {
        width: "100%",
        height: 45,
        borderWidth: 1,
        borderColor: "#999999",
        borderRadius: 6,
        paddingHorizontal: 10,
        fontSize: 15,
        textAlign: "right",
        backgroundColor: "#FFFFFF",
    },

});