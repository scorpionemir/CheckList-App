import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

export const saveToken = async (token) => {
    if (!token) {
        throw new Error("Token is required");
    }

    await SecureStore.setItemAsync(
        TOKEN_KEY,
        token
    );
};

export const getToken = async () => {
    return await SecureStore.getItemAsync(
        TOKEN_KEY
    );
};

export const removeToken = async () => {
    await SecureStore.deleteItemAsync(
        TOKEN_KEY
    );
};

export const hasToken = async () => {
    const token = await getToken();

    return Boolean(token);
};