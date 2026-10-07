import React from "react";

import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAuth } from "../context/AuthContext";

const ArchiveScreen = ({
    navigation,
}) => {
    const { logout } =
        useAuth();

    const handleLogout = () => {
        Alert.alert(
            "خروج از حساب",
            "آیا از خروج از حساب کاربری اطمینان دارید؟",
            [
                {
                    text: "انصراف",
                    style: "cancel",
                },
                {
                    text: "خروج",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    return (
        <View
            style={styles.container}
        >
            <TouchableOpacity
                style={styles.button}
                onPress={() =>
                    navigation.navigate(
                        "Checklist1Archive"
                    )
                }
            >
                <Text
                    style={
                        styles.buttonText
                    }
                >
                    آرشیو چک لیست آنتن
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() =>
                    navigation.navigate(
                        "Checklist2Archive"
                    )
                }
            >
                <Text
                    style={
                        styles.buttonText
                    }
                >
                    آرشیو چک لیست بیسیم
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() =>
                    navigation.navigate(
                        "DraftArchive"
                    )
                }
            >
                <Text
                    style={
                        styles.buttonText
                    }
                >
                    پیش نویس‌ها
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.button,
                    styles.logoutButton,
                ]}
                onPress={
                    handleLogout
                }
            >
                <Text
                    style={
                        styles.logoutText
                    }
                >
                    خروج از حساب
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default ArchiveScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent:
            "center",
        gap: 15,
    },

    button: {
        width: "100%",
        height: 40,
        borderRadius: 8,
        backgroundColor:
            "#c5882d",
        justifyContent:
            "center",
        alignItems:
            "center",
    },

    buttonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight:
            "bold",
    },

    logoutButton: {
        marginTop: 20,
        backgroundColor:
            "#ffffff",
        borderWidth: 1,
        borderColor:
            "#c0392b",
    },

    logoutText: {
        color: "#c0392b",
        fontSize: 17,
        fontWeight:
            "bold",
    },
});