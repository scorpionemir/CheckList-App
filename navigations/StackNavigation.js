import React from "react";

import {
    createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import TabNavigation from "./TabNavigation";

import Checklist1ArchiveScreen from "../screens/Checklist1Archive";
import Checklist2ArchiveScreen from "../screens/Checklist2Archive";
import DraftArchiveScreen from "../screens/DraftArchive";
import ChecklistDetail from "../screens/ChecklistDetail";

const Stack = createNativeStackNavigator();

const StackNavigation = () => {
    const { isAuthenticated, user } = useAuth();

    // Only contractors can use the mobile application.
    const canUseMobileApp =
        isAuthenticated &&
        user?.role === "contractor" &&
        user?.isActive !== false;

    return (
        <Stack.Navigator>
            {!canUseMobileApp ? (
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        headerShown: false,
                    }}
                />
            ) : (
                <>
                    <Stack.Screen
                        name="CheckList"
                        component={TabNavigation}
                        options={{
                            headerShown: false,
                        }}
                    />

                    <Stack.Screen
                        name="Checklist1Archive"
                        component={Checklist1ArchiveScreen}
                        options={{
                            title: "آرشیو چک لیست ۱",
                            headerStyle: {
                                backgroundColor: "#c5882d",
                            },
                            headerTitleStyle: {
                                color: "#FFFFFF",
                                fontWeight: "bold",
                            },
                            headerTitleAlign: "center",
                        }}
                    />

                    <Stack.Screen
                        name="Checklist2Archive"
                        component={Checklist2ArchiveScreen}
                        options={{
                            title: "آرشیو چک لیست ۲",
                            headerStyle: {
                                backgroundColor: "#c5882d",
                            },
                            headerTitleStyle: {
                                color: "#FFFFFF",
                                fontWeight: "bold",
                            },
                            headerTitleAlign: "center",
                        }}
                    />

                    <Stack.Screen
                        name="DraftArchive"
                        component={DraftArchiveScreen}
                        options={{
                            title: "پیش‌نویس‌ها",
                            headerStyle: {
                                backgroundColor: "#c5882d",
                            },
                            headerTitleStyle: {
                                color: "#FFFFFF",
                                fontWeight: "bold",
                            },
                            headerTitleAlign: "center",
                        }}
                    />

                    <Stack.Screen
                        name="ChecklistDetail"
                        component={ChecklistDetail}
                        options={{
                            title: "جزئیات چک لیست",
                            headerStyle: {
                                backgroundColor: "#c5882d",
                            },
                            headerTitleStyle: {
                                color: "#FFFFFF",
                                fontWeight: "bold",
                            },
                            headerTitleAlign: "center",
                        }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};

export default StackNavigation;