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


const TowerHeight = ({ data, onChange }) => {

    return (
        <TableContainer>

            <TableHeader title="ارتفاع دکل" />

            {/* ارتفاع دکل */}
            <TableRow>

                <TableLabel title="ارتفاع دکل (m)" />

                <TableValue>

                    <TextInput
                        style={styles.heightInput}
                        value={
                            data.height !== null
                                ? String(data.height)
                                : ""
                        }
                        onChangeText={(value) =>
                            onChange("height", value)
                        }
                        keyboardType="numeric"
                        placeholder="ارتفاع را بر حسب متر وارد کنید"
                    />

                </TableValue>

            </TableRow>


            {/* توضیحات */}
            <TableRow>

                <TableLabel title="توضیحات" />

                <TableValue>

                    <TextInput
                        style={styles.descriptionInput}
                        value={data.description}
                        onChangeText={(value) =>
                            onChange("description", value)
                        }
                        placeholder="توضیحات را وارد کنید"
                        multiline
                        textAlign="right"
                        textAlignVertical="top"
                    />

                </TableValue>

            </TableRow>

        </TableContainer>
    );
};


export default React.memo(TowerHeight);


const styles = StyleSheet.create({

    heightInput: {
        width: "100%",
        minHeight: 45,
        fontSize: 16,
        textAlign: "center",
    },

    descriptionInput: { width: "100%", minHeight: 100, marginVertical: 10, borderWidth: 1, borderColor: "#999999", borderRadius: 8, backgroundColor: "#FFFFFF", fontSize: 15, paddingHorizontal: 12, paddingVertical: 12, textAlign: "right", textAlignVertical: "top", },

});