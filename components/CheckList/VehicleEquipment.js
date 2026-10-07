import React from "react";

import {
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import TableContainer from "./Table/TableContainer";
import TableHeader from "./Table/TableHeader";
import TableRow from "./Table/TableRow";
import TableLabel from "./Table/TableLabel";
import TableValue from "./Table/TableValue";

import IranianLicensePlate from "./Vehicle/IranianLicensePlate";


const VehicleEquipment = ({
    data = {
        firstTwoNumbers: "",
        letter: "",
        lastThreeNumbers: "",
        cityCode: "",
        vehicleType: "",
        installedEquipment: "",
        antennaType: "",
        description: "",
    },
    onChange,
}) => {

    return (
        <TableContainer>

            <TableHeader title="مشخصات وسیله نقلیه و تجهیزات نصبی" />


            {/* پلاک خودرو */}

            <TableRow>

                <TableLabel title="شماره انتظامی خودرو" />

                <TableValue>

                    {/* <View style={styles.plateContainer}>

                        {/* دو رقم اول */}

                        {/* <TextInput
                            style={[
                                styles.plateInput,
                                styles.twoNumbers,
                            ]}
                            value={data.firstTwoNumbers}
                            onChangeText={(text) =>
                                onChange(
                                    "firstTwoNumbers",
                                    text
                                        .replace(/[^0-9]/g, "")
                                        .slice(0, 2)
                                )
                            }
                            keyboardType="numeric"
                            maxLength={2}
                            placeholder="15"
                            placeholderTextColor="#999"
                        /> */}


                        {/* حرف فارسی */}

                        {/* <TextInput
                            style={[
                                styles.plateInput,
                                styles.letter,
                            ]}
                            value={data.letter}
                            onChangeText={(text) =>
                                onChange(
                                    "letter",
                                    text.slice(-1)
                                )
                            }
                            maxLength={1}
                            placeholder="ب"
                            placeholderTextColor="#999"
                            textAlign="center"
                        /> */}


                        {/* سه رقم */}

                        {/* <TextInput
                            style={[
                                styles.plateInput,
                                styles.threeNumbers,
                            ]}
                            value={data.lastThreeNumbers}
                            onChangeText={(text) =>
                                onChange(
                                    "lastThreeNumbers",
                                    text
                                        .replace(/[^0-9]/g, "")
                                        .slice(0, 3)
                                )
                            }
                            keyboardType="numeric"
                            maxLength={3}
                            placeholder="287"
                            placeholderTextColor="#999"
                        /> */}


                        {/* کد شهر */}

                        {/* <TextInput
                            style={[
                                styles.plateInput,
                                styles.cityCode,
                            ]}
                            value={data.cityCode}
                            onChangeText={(text) =>
                                onChange(
                                    "cityCode",
                                    text
                                        .replace(/[^0-9]/g, "")
                                        .slice(0, 2)
                                )
                            }
                            keyboardType="numeric"
                            maxLength={2}
                            placeholder="15"
                            placeholderTextColor="#999"
                        />

                    </View> */} */

                    <IranianLicensePlate
    data={data}
    onChange={onChange}
/>

                </TableValue>

            </TableRow>


            {/* نوع خودرو */}

            <TableRow>

                <TableLabel title="نوع خودرو" />

                <TableValue>

                    <TextInput
                        style={styles.input}
                        value={data.vehicleType}
                        onChangeText={(value) =>
                            onChange(
                                "vehicleType",
                                value
                            )
                        }
                        placeholder="مقدار را وارد کنید"
                        placeholderTextColor="#999"
                    />

                </TableValue>

            </TableRow>


            {/* تجهیزات نصبی */}

            <TableRow>

                <TableLabel title="تجهیزات نصبی" />

                <TableValue>

                    <TextInput
                        style={styles.input}
                        value={data.installedEquipment}
                        onChangeText={(value) =>
                            onChange(
                                "installedEquipment",
                                value
                            )
                        }
                        placeholder="مقدار را وارد کنید"
                        placeholderTextColor="#999"
                    />

                </TableValue>

            </TableRow>


            {/* نوع آنتن */}

            <TableRow>

                <TableLabel title="نوع آنتن" />

                <TableValue>

                    <TextInput
                        style={styles.input}
                        value={data.antennaType}
                        onChangeText={(value) =>
                            onChange(
                                "antennaType",
                                value
                            )
                        }
                        placeholder="مقدار را وارد کنید"
                        placeholderTextColor="#999"
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
                            onChange(
                                "description",
                                value
                            )
                        }
                        placeholder="توضیحات را وارد کنید"
                        placeholderTextColor="#999"
                        multiline
                        textAlignVertical="top"
                    />

                </TableValue>

            </TableRow>

        </TableContainer>
    );
};


export default React.memo(VehicleEquipment);


const styles = StyleSheet.create({

    // plateContainer: {
    //     width: "100%",
    //     flexDirection: "row",
    //     alignItems: "center",
    //     justifyContent: "flex-start",
    //     gap: 5,
    // },

    // plateInput: {
    //     height: 45,
    //     borderWidth: 1,
    //     borderColor: "#777777",
    //     borderRadius: 4,
    //     backgroundColor: "#FFFFFF",
    //     fontSize: 14,
    //     textAlign: "center",
    //     paddingHorizontal: 4,
    // },

    // cityCode: {
    //     width: 40,
    // },

    // threeNumbers: {
    //     width: 55,
    // },

    // letter: {
    //     width: 40,
    // },

    // twoNumbers: {
    //     width: 40,
    // },

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

    descriptionInput: { width: "100%", minHeight: 100, marginVertical: 10, borderWidth: 1, borderColor: "#999999", borderRadius: 8, backgroundColor: "#FFFFFF", fontSize: 15, paddingHorizontal: 12, paddingVertical: 12, textAlign: "right", textAlignVertical: "top", },

});