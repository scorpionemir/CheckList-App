// components/CheckList/SiteLocation.js

import React, {
    useEffect,
    useState,
} from "react";

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

import GetGPS from "./Location/GetGPS";
import MapPicker from "./Location/MapPicker";


const SiteLocation = ({
    data,
    onChange,
}) => {

    // ==========================
    // مقدار متنی مختصات دستی
    // ==========================

    const [
        manualLatitudeText,
        setManualLatitudeText,
    ] = useState(
        data?.manual?.latitude !== null &&
        data?.manual?.latitude !== undefined
            ? String(data.manual.latitude)
            : ""
    );


    const [
        manualLongitudeText,
        setManualLongitudeText,
    ] = useState(
        data?.manual?.longitude !== null &&
        data?.manual?.longitude !== undefined
            ? String(data.manual.longitude)
            : ""
    );


    // ==========================
    // هماهنگ شدن با Draft / Edit
    // ==========================

    useEffect(() => {

        setManualLatitudeText(
            data?.manual?.latitude !== null &&
            data?.manual?.latitude !== undefined
                ? String(data.manual.latitude)
                : ""
        );

        setManualLongitudeText(
            data?.manual?.longitude !== null &&
            data?.manual?.longitude !== undefined
                ? String(data.manual.longitude)
                : ""
        );

    }, [
        data?.manual?.latitude,
        data?.manual?.longitude,
    ]);


    // ==========================
    // دریافت GPS
    // ==========================

    const handleGPSLocation = (location) => {

        onChange(
            "source",
            location.source
        );

        onChange(
            "gps",
            {
                latitude:
                    location.latitude,

                longitude:
                    location.longitude,
            }
        );

        onChange(
            "manual",
            {
                latitude: null,
                longitude: null,
            }
        );

        setManualLatitudeText("");
        setManualLongitudeText("");
    };


    // ==========================
    // ورود دستی عرض
    // ==========================

    const handleManualLatitude = (
        value
    ) => {

        // فقط اعداد، منفی و اعشار
        if (!/^-?\d*\.?\d*$/.test(value)) {
            return;
        }

        setManualLatitudeText(value);

        if (value === "" || value === "-") {

            onChange(
                "manual",
                {
                    ...data.manual,
                    latitude: null,
                }
            );

            return;
        }

        const number =
            Number(value);

        if (!Number.isNaN(number)) {

            onChange(
                "manual",
                {
                    ...data.manual,
                    latitude: number,
                }
            );

            onChange(
                "source",
                "manual"
            );
        }
    };


    // ==========================
    // ورود دستی طول
    // ==========================

    const handleManualLongitude = (
        value
    ) => {

        if (!/^-?\d*\.?\d*$/.test(value)) {
            return;
        }

        setManualLongitudeText(value);

        if (value === "" || value === "-") {

            onChange(
                "manual",
                {
                    ...data.manual,
                    longitude: null,
                }
            );

            return;
        }

        const number =
            Number(value);

        if (!Number.isNaN(number)) {

            onChange(
                "manual",
                {
                    ...data.manual,
                    longitude: number,
                }
            );

            onChange(
                "source",
                "manual"
            );
        }
    };


    return (

        <TableContainer>

            <TableHeader
                title="موقعیت سایت"
            />


            {/* ==========================
                دریافت GPS
            ========================== */}

            <TableRow>

                <TableLabel
                    title="موقعیت GPS"
                />

                <TableValue>

                    <GetGPS
                        onLocationChange={
                            handleGPSLocation
                        }
                    />

                </TableValue>

            </TableRow>


            {/* ==========================
                عرض GPS
            ========================== */}

            <TableRow>

                <TableLabel
                    title="عرض جغرافیایی"
                />

                <TableValue>

                    <TextInput
                        style={styles.input}

                        value={
                            data?.gps?.latitude !== null &&
                            data?.gps?.latitude !== undefined
                                ? String(
                                    data.gps.latitude
                                )
                                : ""
                        }

                        editable={false}

                        placeholder="هنوز ثبت نشده"
                    />

                </TableValue>

            </TableRow>


            {/* ==========================
                طول GPS
            ========================== */}

            <TableRow>

                <TableLabel
                    title="طول جغرافیایی"
                />

                <TableValue>

                    <TextInput
                        style={styles.input}

                        value={
                            data?.gps?.longitude !== null &&
                            data?.gps?.longitude !== undefined
                                ? String(
                                    data.gps.longitude
                                )
                                : ""
                        }

                        editable={false}

                        placeholder="هنوز ثبت نشده"
                    />

                </TableValue>

            </TableRow>


            {/* ==========================
                ورود دستی عرض
            ========================== */}

            <TableRow>

                <TableLabel
                    title="ورود دستی عرض"
                />

                <TableValue>

                    <TextInput
                        style={styles.input}

                        value={
                            manualLatitudeText
                        }

                        onChangeText={
                            handleManualLatitude
                        }

                        keyboardType="numbers-and-punctuation"

                        placeholder="عرض جغرافیایی"

                    />

                </TableValue>

            </TableRow>


            {/* ==========================
                ورود دستی طول
            ========================== */}

            <TableRow>

                <TableLabel
                    title="ورود دستی طول"
                />

                <TableValue>

                    <TextInput
                        style={styles.input}

                        value={
                            manualLongitudeText
                        }

                        onChangeText={
                            handleManualLongitude
                        }

                        keyboardType="numbers-and-punctuation"

                        placeholder="طول جغرافیایی"

                    />

                </TableValue>

            </TableRow>


            {/* ==========================
                روش ثبت
            ========================== */}

            <TableRow>

                <TableLabel
                    title="روش ثبت"
                />

                <TableValue>

                    <Text
                        style={
                            styles.sourceText
                        }
                    >

                        {
                            data.source === "gps"
                                ? "GPS"
                                : data.source === "manual"
                                    ? "دستی"
                                    : "ثبت نشده"
                        }

                    </Text>

                </TableValue>

            </TableRow>


            {/* ==========================
                نقشه
            ========================== */}

            <View
                style={styles.mapRow}
            >

                <Text
                    style={styles.mapTitle}
                >
                    موقعیت روی نقشه
                </Text>


                <MapPicker
    latitude={
        data?.source === "manual"
            ? data?.manual?.latitude
            : data?.gps?.latitude
    }
    longitude={
        data?.source === "manual"
            ? data?.manual?.longitude
            : data?.gps?.longitude
    }
/>

            </View>

        </TableContainer>
    );
};


export default React.memo(SiteLocation);


const styles = StyleSheet.create({

    input: {
        width: "100%",
        minHeight: 45,
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },

    sourceText: {
        width: "100%",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },

    mapRow: {
        width: "100%",
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: "#333333",
    },

    mapTitle: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "right",
        marginBottom: 10,
    },

});