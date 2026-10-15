import React from "react";
import { Image } from "react-native";

import { createNativeBottomTabNavigator } from "@react-navigation/bottom-tabs/unstable";

import AntennaScreen from "../screens/AntennaScreen";
import WirelessScreen from "../screens/WirelessScreen";
import ArchiveScreen from "../screens/ArchiveScreen";

const Tab = createNativeBottomTabNavigator();

const TabNavigation = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: true,

                headerStyle: {
                    backgroundColor: "#c5882d",
                },

                headerTitleStyle: {
                    fontSize: 15,
                    fontWeight: "bold",
                    color: "white",
                },

                headerTitleAlign: "center",

                tabBarActiveTintColor: "#c5882d",
                tabBarInactiveTintColor: "gray",

                tabBarStyle: {
                    backgroundColor: "#fff",
                    height: 50,
                },
            }}
        >
            <Tab.Screen
                name="Antenna"
                component={AntennaScreen}
                options={{
                    headerTitle: "چک لیست دکل و آنتن و سیستم ارتینگ",
                    tabBarLabel: "آنتن",

                    tabBarIcon: ({ color }) => (
                        <Image
                            source={require("../assets/images/icons8-antenna-ios-27-filled-32.png")}
                            style={{
                                width: 24,
                                height: 24,
                                resizeMode: "contain",
                                tintColor: color,
                            }}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Wireless"
                component={WirelessScreen}
                options={{
                    headerTitle:
                        "چک لیست بی سیم ها اعم از تکرارکننده، ثابت، خودرویی، دستی",
                    tabBarLabel: "بی‌سیم",

                    tabBarIcon: ({ color }) => (
                        <Image
                            source={require("../assets/images/icons8-wireless-others-32.png")}
                            style={{
                                width: 24,
                                height: 24,
                                resizeMode: "contain",
                                tintColor: color,
                            }}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Archive"
                component={ArchiveScreen}
                options={{
                    headerTitle: "آرشیو چک لیست ها",
                    tabBarLabel: "آرشیو",

                    tabBarIcon: ({ color }) => (
                        <Image
                            source={require("../assets/images/icons8-archive-windows-11-filled-32.png")}
                            style={{
                                width: 24,
                                height: 24,
                                resizeMode: "contain",
                                tintColor: color,
                            }}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigation;