import React from "react";

import { createNativeBottomTabNavigator } from "@react-navigation/bottom-tabs/unstable";

import AntennaScreen from "../screens/AntennaScreen";
import WirelessScreen from "../screens/WirelessScreen";
import ArchiveScreen from "../screens/ArchiveScreen";

import { Ionicons } from "@expo/vector-icons";

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

            {/* ==================== آنتن ==================== */}

            <Tab.Screen
                name="Antenna"
                component={AntennaScreen}
                options={{
                    headerTitle:
                        "چک لیست دکل و آنتن و سیستم ارتینگ",

                    tabBarLabel: "آنتن",

                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="cellular"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            {/* ==================== بی سیم ==================== */}

            <Tab.Screen
                name="Wireless"
                component={WirelessScreen}
                options={{
                    headerTitle:
                        "چک لیست بی سیم ها اعم از تکرارکننده، ثابت، خودرویی، دستی",

                    tabBarLabel: "بی‌سیم",

                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="wifi"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            {/* ==================== آرشیو ==================== */}

            <Tab.Screen
                name="Archive"
                component={ArchiveScreen}
                options={{
                    headerTitle: "آرشیو چک لیست ها",

                    tabBarLabel: "آرشیو",

                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="archive"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

        </Tab.Navigator>
    );
};

export default TabNavigation;