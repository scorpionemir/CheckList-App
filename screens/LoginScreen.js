import React from "react";

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";

import Brands from "../components/Login/Brands";
import LoginForm from "../components/Login/LoginForm";

const LoginScreen = () => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContainer
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Brands />

        <LoginForm />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5882d",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingTop: 50,
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
});