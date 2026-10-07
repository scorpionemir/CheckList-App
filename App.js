import React, {
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
    I18nManager,
    StyleSheet,
    View,
} from "react-native";

import {
    NavigationContainer,
} from "@react-navigation/native";

import {
    AuthProvider,
    useAuth,
} from "./context/AuthContext";

import StackNavigation from "./navigations/StackNavigation";

import {
    initializeSync,
} from "./services/syncBootstrap";

import SyncStatusBar from "./components/SyncStatusBar";

import SplashScreen from "./components/SplashScreen";


I18nManager.allowRTL(true);
I18nManager.forceRTL(true);



const AppContent = () => {

    const {
        loading,
    } = useAuth();


    if (loading) {

        return (

            <View
                style={
                    styles.loadingContainer
                }
            >

                <ActivityIndicator
                    size="large"
                    color="#c5882d"
                />

            </View>

        );

    }


    return (

        <View
            style={
                styles.container
            }
        >

            <SyncStatusBar />


            <View
                style={
                    styles.navigationContainer
                }
            >

                <NavigationContainer>

                    <StackNavigation />

                </NavigationContainer>


            </View>


        </View>

    );

};




const App = () => {


    const [showSplash, setShowSplash] = useState(true);



    useEffect(() => {

        initializeSync();

    }, []);




    if (showSplash) {

        return (

            <SplashScreen
                onFinish={() =>
                    setShowSplash(false)
                }
            />

        );

    }



    return (

        <AuthProvider>

            <AppContent />

        </AuthProvider>

    );

};



export default App;




const styles =
    StyleSheet.create({

        container: {

            flex: 1,

        },


        navigationContainer: {

            flex: 1,

        },


        loadingContainer: {

            flex: 1,

            justifyContent:
                "center",

            alignItems:
                "center",

        },

    });