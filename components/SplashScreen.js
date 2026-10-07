import React, { useEffect, useRef } from "react";
import {
    Animated,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

const SplashScreen = ({ onFinish }) => {
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslate = useRef(new Animated.Value(15)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 80,
                    useNativeDriver: true,
                }),

                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),

            Animated.parallel([
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),

                Animated.timing(titleTranslate, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        const timer = setTimeout(() => {
            onFinish();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: logoOpacity,
                        transform: [
                            {
                                scale: logoScale,
                            },
                        ],
                    },
                ]}
            >
                <Image
                    source={require("../assets/images/gas-logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>

            <Animated.View
                style={[
                    styles.titleContainer,
                    {
                        opacity: titleOpacity,
                        transform: [
                            {
                                translateY: titleTranslate,
                            },
                        ],
                    },
                ]}
            >
                <Text style={styles.title}>
                    سامانه بازرسی و چک‌لیست گاز
                </Text>

                <Text style={styles.subtitle}>
                    سامانه مدیریت و ثبت اطلاعات بازرسی
                </Text>
            </Animated.View>
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },

    logoContainer: {
        width: 130,
        height: 130,
        alignItems: "center",
        justifyContent: "center",
    },

    logo: {
        width: 110,
        height: 110,
    },

    titleContainer: {
        alignItems: "center",
        marginTop: 25,
        paddingHorizontal: 25,
    },

    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        color: "#222222",
    },

    subtitle: {
        marginTop: 8,
        fontSize: 14,
        textAlign: "center",
        color: "#777777",
    },
});