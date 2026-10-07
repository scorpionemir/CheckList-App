import React from "react";

import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useFormik } from "formik";
import * as Yup from "yup";

import { I18nManager } from "react-native";

import { useAuth } from "../../context/AuthContext";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const LoginForm = () => {

    const { login } = useAuth();

    // const handleLogin = async (values) => {
    //     try {
    //         const result = await login(
    //             values.username,
    //             values.password
    //         );

    //         console.log(
    //             "Login successful:",
    //             result
    //         );

    //     } catch (error) {
    //         console.error(
    //             "Login error:",
    //             error
    //         );

    //         Alert.alert(
    //             "خطا",
    //             error?.message ||
    //                 "نام کاربری یا رمز عبور اشتباه است"
    //         );
    //     }
    // };

    const handleLogin = async (values) => {
    Alert.alert(
        "مرحله 1",
        "دکمه ورود کلیک شد"
    );

    try {
        Alert.alert(
            "مرحله 2",
            `Username: ${values.username}\nPassword: ${
                values.password ? "وارد شده" : "خالی"
            }`
        );

        Alert.alert(
            "مرحله 3",
            "در حال ارسال درخواست به سرور..."
        );

        const result = await login(
            values.username,
            values.password
        );

        Alert.alert(
            "مرحله 4",
            `Login موفق بود\n\n${JSON.stringify(
                result,
                null,
                2
            )}`
        );

        console.log(
            "Login successful:",
            result
        );

    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        Alert.alert(
            "خطا در Login",
            `Message: ${
                error?.message ||
                "خطای نامشخص"
            }\n\nCode: ${
                error?.code ||
                "ندارد"
            }\n\nStatus: ${
                error?.status ||
                "ندارد"
            }`
        );
    }
};

    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
        },

        validationSchema: Yup.object({
            username: Yup.string()
                .required(
                    "نام کاربری الزامی است"
                ),

            password: Yup.string()
                .required(
                    "رمز عبور الزامی است"
                ),
        }),

        onSubmit: handleLogin,
    });

    return (
        <View style={styles.wrapper}>

            <View style={styles.formInput}>

                <TextInput
                    placeholder="نام کاربری"
                    placeholderTextColor="#444"
                    textAlign="right"
                    value={
                        formik.values.username
                    }
                    onChangeText={
                        formik.handleChange(
                            "username"
                        )
                    }
                    onBlur={
                        formik.handleBlur(
                            "username"
                        )
                    }
                    textContentType="username"
                    autoFocus
                />

                {formik.touched.username &&
                    formik.errors.username && (
                        <Text
                            style={styles.error}
                        >
                            {
                                formik.errors
                                    .username
                            }
                        </Text>
                    )}

            </View>

            <View style={styles.formInput}>

                <TextInput
                    placeholder="رمز عبور"
                    placeholderTextColor="#444"
                    textAlign="right"
                    secureTextEntry
                    value={
                        formik.values.password
                    }
                    onChangeText={
                        formik.handleChange(
                            "password"
                        )
                    }
                    onBlur={
                        formik.handleBlur(
                            "password"
                        )
                    }
                    textContentType="password"
                    autoCorrect={false}
                />

                {formik.touched.password &&
                    formik.errors.password && (
                        <Text
                            style={styles.error}
                        >
                            {
                                formik.errors
                                    .password
                            }
                        </Text>
                    )}

            </View>

            <View>

                <Pressable
                    style={styles.button}
                    onPress={
                        formik.handleSubmit
                    }
                >
                    <Text
                        style={
                            styles.buttonText
                        }
                    >
                         ورود
                    </Text>
                </Pressable>

            </View>

        </View>
    );
};

export default LoginForm;

const styles = StyleSheet.create({

    wrapper: {
        marginTop: 60,
    },

    formInput: {
        borderBlockColor: "#2c2a2a",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 12,
        marginBottom: 10,
        backgroundColor: "#fAfAfA",
        padding: 20,
        marginTop: 10,
    },

    button: {
        borderRadius: 5,
        borderWidth: 1,
        backgroundColor: "#218DAE",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
        padding: 10,
    },

    buttonText: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },

    error: {
        color: "red",
        marginTop: 5,
    },
});