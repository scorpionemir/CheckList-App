
import React from "react";

import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    I18nManager,
} from "react-native";

import { useFormik } from "formik";
import * as Yup from "yup";

import { useAuth } from "../../context/AuthContext";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const LoginForm = () => {
    const { login } = useAuth();

    const handleLogin = async (values) => {
        try {
            const result = await login(
                values.username,
                values.password
            );

            console.log("Login successful:", result);
        } catch (error) {
            console.error("Login error:", error);

            Alert.alert(
                "خطا در ورود",
                error?.message ||
                    "نام کاربری یا رمز عبور اشتباه است"
            );
        }
    };

    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
        },

        validationSchema: Yup.object({
            username: Yup.string().required(
                "نام کاربری الزامی است"
            ),

            password: Yup.string().required(
                "رمز عبور الزامی است"
            ),
        }),

        onSubmit: handleLogin,
    });

    const isLoading = formik.isSubmitting;

    return (
        <View style={styles.wrapper}>
            <View style={styles.formInput}>
                <TextInput
                    placeholder="نام کاربری"
                    placeholderTextColor="#444"
                    textAlign="right"
                    value={formik.values.username}
                    onChangeText={formik.handleChange("username")}
                    onBlur={formik.handleBlur("username")}
                    textContentType="username"
                    autoFocus
                    editable={!isLoading}
                />

                {formik.touched.username &&
                    formik.errors.username && (
                        <Text style={styles.error}>
                            {formik.errors.username}
                        </Text>
                    )}
            </View>

            <View style={styles.formInput}>
                <TextInput
                    placeholder="رمز عبور"
                    placeholderTextColor="#444"
                    textAlign="right"
                    secureTextEntry
                    value={formik.values.password}
                    onChangeText={formik.handleChange("password")}
                    onBlur={formik.handleBlur("password")}
                    textContentType="password"
                    autoCorrect={false}
                    editable={!isLoading}
                />

                {formik.touched.password &&
                    formik.errors.password && (
                        <Text style={styles.error}>
                            {formik.errors.password}
                        </Text>
                    )}
            </View>

            <View>
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && !isLoading && styles.buttonPressed,
                        isLoading && styles.buttonLoading,
                    ]}
                    onPress={formik.handleSubmit}
                    disabled={isLoading}
                    accessibilityRole="button"
                    accessibilityLabel="ورود"
                    accessibilityState={{
                        disabled: isLoading,
                        busy: isLoading,
                    }}
                >
                    {isLoading ? (
                        <View style={styles.loadingContent}>
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                            />
                            <Text style={styles.buttonText}>
                                در حال ورود...
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.buttonText}>
                            ورود
                        </Text>
                    )}
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
        borderColor: "#2c2a2a",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 12,
        marginBottom: 10,
        backgroundColor: "#FAFAFA",
        padding: 20,
        marginTop: 10,
    },

    button: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#19718C",
        backgroundColor: "#218DAE",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
        padding: 12,
        minHeight: 52,
    },

    buttonPressed: {
        backgroundColor: "#176780",
        borderColor: "#12566B",
        transform: [{ scale: 0.98 }],
    },

    buttonLoading: {
        backgroundColor: "#176780",
        borderColor: "#12566B",
        opacity: 0.9,
    },

    loadingContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
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
