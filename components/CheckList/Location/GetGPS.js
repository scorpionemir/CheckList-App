// components/CheckList/Location/GetGPS.js

import React, { useState } from "react";

import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import * as Location from "expo-location";

const GetGPS = ({ onLocationChange }) => {

    const [loading, setLoading] = useState(false);

    const getCurrentLocation = async () => {

        try {

            setLoading(true);

            // ==========================
            // درخواست مجوز
            // ==========================

            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {

                Alert.alert(
                    "دسترسی به موقعیت مکانی",
                    "دسترسی به موقعیت مکانی داده نشد."
                );

                setLoading(false);

                return;
            }

            // ==========================
            // بررسی روشن بودن Location
            // ==========================

            const servicesEnabled =
                await Location.hasServicesEnabledAsync();

            if (!servicesEnabled) {

                Alert.alert(
                    "GPS خاموش است",
                    "لطفاً GPS یا Location دستگاه را روشن کنید."
                );

                setLoading(false);

                return;
            }

            // ==========================
            // دریافت موقعیت
            // ==========================

            const currentLocation =
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

            const latitude =
                currentLocation.coords.latitude;

            const longitude =
                currentLocation.coords.longitude;

            // ==========================
            // ارسال موقعیت
            // ==========================

            onLocationChange({
                latitude,
                longitude,
                source: "gps",
            });

        } catch (error) {

            console.log(
                "GPS Error:",
                error
            );

            Alert.alert(
                "خطا",
                "دریافت موقعیت مکانی انجام نشد. لطفاً GPS دستگاه را بررسی کنید."
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <View style={styles.container}>

            <TouchableOpacity
                style={styles.button}
                onPress={getCurrentLocation}
                disabled={loading}
            >

                <Text style={styles.buttonText}>

                    {loading
                        ? "در حال دریافت موقعیت..."
                        : "دریافت موقعیت فعلی"}

                </Text>

            </TouchableOpacity>

        </View>
    );
};

export default GetGPS;

const styles = StyleSheet.create({

    container: {
        width: "100%",
        alignItems: "center",
    },

    button: {
        width: "100%",
        minHeight: 45,
        backgroundColor: "#EDEDED",
        borderWidth: 1,
        borderColor: "#333333",
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
    },

    buttonText: {
        fontSize: 15,
        fontWeight: "bold",
        textAlign: "center",
    },

});