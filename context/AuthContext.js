import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getToken,
    removeToken,
    saveToken,
} from "../services/authStorage";

import {
    getCurrentUser,
    loginUser,
} from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({
    children,
}) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const restoreSession = async () => {
        try {
            setLoading(true);

            const storedToken = await getToken();

            if (!storedToken) {
                setToken(null);
                setUser(null);
                return;
            }

            setToken(storedToken);

            try {
                const response =
                    await getCurrentUser();

                setUser(
                    response?.user || null
                );
            } catch (error) {
                console.log(
                    "Stored token is invalid:",
                    error
                );

                await removeToken();

                setToken(null);
                setUser(null);
            }
        } catch (error) {
            console.error(
                "Restore session error:",
                error
            );

            await removeToken();

            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        restoreSession();
    }, []);

    // const login = async (
    //     username,
    //     password
    // ) => {
    //     const response =
    //         await loginUser(
    //             username,
    //             password
    //         );

    //     const receivedToken =
    //         response?.token;

    //     if (!receivedToken) {
    //         throw new Error(
    //             "Token از سرور دریافت نشد."
    //         );
    //     }

    //     await saveToken(receivedToken);

    //     setToken(receivedToken);

    //     try {
    //         const currentUser =
    //             await getCurrentUser();

    //         setUser(
    //             currentUser?.user || null
    //         );
    //     } catch (error) {
    //         console.warn(
    //             "Could not load current user:",
    //             error
    //         );

    //         setUser(
    //             response?.user || null
    //         );
    //     }

    //     return response;
    // };

    const login = async (username, password) => {
    console.log("AUTH LOGIN: START");

    const response = await loginUser(username, password);

    console.log("AUTH LOGIN: RESPONSE", response);

    const receivedToken = response?.token;

    if (!receivedToken) {
        throw new Error("Token از سرور دریافت نشد.");
    }

    console.log("AUTH LOGIN: TOKEN RECEIVED");

    await saveToken(receivedToken);

    console.log("AUTH LOGIN: TOKEN SAVED");

    setToken(receivedToken);

    console.log("AUTH LOGIN: SET TOKEN");

    setUser(response?.user || null);

    console.log("AUTH LOGIN: SET USER");

    return response;
};

    const logout = async () => {
        try {
            await removeToken();
        } finally {
            setToken(null);
            setUser(null);
        }
    };

    const handleSessionExpired = async () => {
        await logout();
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                loading,
                isAuthenticated: Boolean(token),
                login,
                logout,
                handleSessionExpired,
                restoreSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};