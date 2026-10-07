import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Checklist1Archive from "../screens/Checklist1Archive";
import Checklist2Archive from "../screens/Checklist2Archive";
import DraftArchive from "../screens/DraftArchive";

const Tab = createBottomTabNavigator();

const ArchiveTabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Checklist1Archive"
        component={Checklist1Archive}
        options={{
          title: "چک‌لیست اول",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="document-text-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Checklist2Archive"
        component={Checklist2Archive}
        options={{
          title: "چک‌لیست دوم",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="document-text-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="DraftArchive"
        component={DraftArchive}
        options={{
          title: "پیش‌نویس‌ها",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="documents-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ArchiveTabNavigation;