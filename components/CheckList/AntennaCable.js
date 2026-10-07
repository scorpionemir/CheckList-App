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

import CheckboxGroup from "../CheckboxGroup";


const AntennaCable = ({ data, onChange }) => {

    const options = [
        "هلیاکس",
        "RG258",
        "RG58",
    ];


    return (
        <TableContainer>

            <TableHeader
                title="نوع کابل آنتن و متراژ تقریبی"
            />

            {/* نوع کابل */}
            <TableRow>

                <TableLabel title="نوع کابل آنتن" />

                <TableValue>

                    <CheckboxGroup
                        options={options}
                        value={data.cableType}
                        onChange={(value) =>
                            onChange("cableType", value)
                        }
                    />

                </TableValue>

            </TableRow>


            {/* متراژ */}
            <TableRow>

                <TableLabel title="(m)متراژ تقریبی" />

                <TableValue>

                    <TextInput
                        style={styles.input}
                        value={
                            data.length !== null
                                ? String(data.length)
                                : ""
                        }
                        onChangeText={(value) =>
                            onChange("length", value)
                        }
                        keyboardType="numeric"
                        placeholder="متراژ را وارد کنید"
                    />

                </TableValue>

            </TableRow>


            {/* توضیحات */}
            <TableRow>

                <TableLabel title="توضیحات" />

                <TableValue>

                    <TextInput
                        style={[
                            styles.input,
                            styles.descriptionInput,
                        ]}
                        value={data.description}
                        onChangeText={(value) =>
                            onChange("description", value)
                        }
                        placeholder="توضیحات را وارد کنید"
                        multiline
                    />

                </TableValue>

            </TableRow>

        </TableContainer>
    );
};


export default React.memo(AntennaCable);


const styles = StyleSheet.create({

    input: {
        width: "100%",
        minHeight: 45,
        fontSize: 16,
        textAlign: "center",
    },

    descriptionInput: {
        minHeight: 80,
        textAlignVertical: "top",
        paddingTop: 10,
    },

});