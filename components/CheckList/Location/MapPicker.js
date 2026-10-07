// // components/CheckList/Location/MapPicker.js

// import React from "react";

// import {
//     StyleSheet,
//     Text,
//     View,
// } from "react-native";

// import MapView, {
//     Marker,
// } from "react-native-maps";


// const MapPicker = ({
//     latitude,
//     longitude,
// }) => {

//     // ==========================
//     // بررسی مختصات
//     // ==========================

//     if (
//         typeof latitude !== "number" ||
//         typeof longitude !== "number" ||
//         Number.isNaN(latitude) ||
//         Number.isNaN(longitude)
//     ) {

//         return (

//             <View
//                 style={
//                     styles.emptyContainer
//                 }
//             >

//                 <Text
//                     style={
//                         styles.emptyText
//                     }
//                 >
//                     ابتدا موقعیت را دریافت کنید
//                 </Text>

//             </View>
//         );
//     }


//     return (

//         <View
//             style={styles.mapContainer}
//         >

//             <MapView

//                 style={styles.map}

//                 mapType="standard"

//                 region={{
//                     latitude,
//                     longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                 }}

//                 showsUserLocation={true}

//                 showsMyLocationButton={true}

//             >

//                 <Marker

//                     coordinate={{
//                         latitude,
//                         longitude,
//                     }}

//                     title="موقعیت سایت"

//                     description="موقعیت ثبت شده سایت"

//                 />

//             </MapView>

//         </View>
//     );
// };


// export default MapPicker;


// const styles = StyleSheet.create({

//     mapContainer: {
//         width: "100%",
//         height: 250,
//         overflow: "hidden",
//         borderRadius: 8,
//         borderWidth: 1,
//         borderColor: "#333333",
//     },

//     map: {
//         width: "100%",
//         height: "100%",
//     },

//     emptyContainer: {
//         width: "100%",
//         height: 100,
//         justifyContent: "center",
//         alignItems: "center",
//         borderWidth: 1,
//         borderColor: "#CCCCCC",
//         borderRadius: 8,
//     },

//     emptyText: {
//         fontSize: 14,
//         textAlign: "center",
//     },

// });

import React, { useMemo } from "react";

import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import { WebView } from "react-native-webview";

const MapPicker = ({
    latitude,
    longitude,
}) => {
    const hasValidLocation =
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude);

    const mapHtml = useMemo(() => {
        if (!hasValidLocation) {
            return "";
        }

        return `
<!DOCTYPE html>

<html lang="fa">

<head>

    <meta
        charset="UTF-8"
    />

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />

    <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />

    <style>

        html,
        body,
        #map {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
        }

        body {
            overflow: hidden;
        }

    </style>

</head>

<body>

    <div id="map"></div>

    <script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">
    </script>

    <script>

        const latitude = ${latitude};
        const longitude = ${longitude};

        const map = L.map("map", {
            zoomControl: true,
            attributionControl: true,
        }).setView(
            [latitude, longitude],
            16
        );

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,
                attribution:
                    "&copy; OpenStreetMap contributors",
            }
        ).addTo(map);

        const marker = L.marker([
            latitude,
            longitude,
        ]).addTo(map);

        marker.bindPopup(
            "موقعیت سایت"
        );

    </script>

</body>

</html>
        `;
    }, [
        latitude,
        longitude,
        hasValidLocation,
    ]);

    if (!hasValidLocation) {
        return (
            <View style={styles.emptyContainer}>

                <Text style={styles.emptyText}>
                    ابتدا موقعیت را دریافت یا وارد کنید
                </Text>

            </View>
        );
    }

    return (
        <View style={styles.container}>

            <View style={styles.coordinateContainer}>

                <Text style={styles.coordinateText}>
                    عرض: {latitude}
                </Text>

                <Text style={styles.coordinateText}>
                    طول: {longitude}
                </Text>

            </View>

            <View style={styles.mapContainer}>

                <WebView
                    originWhitelist={["*"]}
                    source={{
                        html: mapHtml,
                    }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scrollEnabled={false}
                    style={styles.webView}
                />

            </View>

        </View>
    );
};

export default React.memo(MapPicker);

const styles = StyleSheet.create({

    container: {
        width: "100%",
        marginTop: 10,
    },

    coordinateContainer: {
        width: "100%",
        marginBottom: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: "#CCCCCC",
        borderRadius: 6,
        backgroundColor: "#F7F7F7",
    },

    coordinateText: {
        fontSize: 13,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 2,
    },

    mapContainer: {
        width: "100%",
        height: 300,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#333333",
        borderRadius: 8,
    },

    webView: {
        flex: 1,
        backgroundColor: "#EEEEEE",
    },

    emptyContainer: {
        width: "100%",
        height: 100,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#CCCCCC",
        borderRadius: 8,
    },

    emptyText: {
        fontSize: 14,
        textAlign: "center",
    },

});