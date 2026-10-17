
import React from "react";
import { Image } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AntennaScreen from "../screens/AntennaScreen";
import WirelessScreen from "../screens/WirelessScreen";
import ArchiveScreen from "../screens/ArchiveScreen";

const Tab = createBottomTabNavigator();

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

                tabBarShowLabel: true,
                tabBarHideOnKeyboard: true,

                tabBarActiveTintColor: "#c5882d",
                tabBarInactiveTintColor: "gray",

                tabBarStyle: {
                    backgroundColor: "#fff",
                    height: 72,
                    paddingTop: 6,
                    paddingBottom: 6,
                },

                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "bold",
                    marginTop: 2,
                },

                tabBarIconStyle: {
                    marginTop: 0,
                },
            }}
        >
            <Tab.Screen
                name="Antenna"
                component={AntennaScreen}
                options={{
                    headerTitle: "چک لیست دکل و آنتن و سیستم ارتینگ",
                    tabBarLabel: "آنتن",

                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={require("../assets/images/icons8-antenna-ios-27-filled-32.png")}
                            style={{
                                width: 26,
                                height: 26,
                                resizeMode: "contain",
                                opacity: focused ? 1 : 0.65,
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

                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={require("../assets/images/icons8-wireless-others-32.png")}
                            style={{
                                width: 26,
                                height: 26,
                                resizeMode: "contain",
                                opacity: focused ? 1 : 0.65,
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

                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={require("../assets/images/icons8-archive-windows-11-filled-32.png")}
                            style={{
                                width: 26,
                                height: 26,
                                resizeMode: "contain",
                                opacity: focused ? 1 : 0.65,
                            }}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigation;
