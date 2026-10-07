import * as Network
    from "expo-network";


// ============================================================
// Get Current Network State
// ============================================================

export const getNetworkState =
    async () => {

        try {

            const state =
                await Network
                    .getNetworkStateAsync();

            return state;

        } catch (error) {

            console.error(
                "Get network state error:",
                error
            );

            return {
                isConnected: false,
                isInternetReachable:
                    false,
                type: "UNKNOWN",
            };
        }
    };


// ============================================================
// Check Online
// ============================================================

export const isOnline =
    async () => {

        const state =
            await getNetworkState();

        /*
            برای اپلیکیشن ما isConnected
            مهم‌تر از isInternetReachable است.

            دلیل:
            API روی سیستم/شبکه محلی هم
            می‌تواند قابل دسترسی باشد.
        */

        return (
            state?.isConnected === true
        );
    };


// ============================================================
// Subscribe
// ============================================================

export const subscribeToNetworkChanges =
    (
        callback
    ) => {

        const subscription =
            Network.addNetworkStateListener(
                (state) => {

                    if (
                        callback
                    ) {
                        callback(
                            state
                        );
                    }
                }
            );

        return subscription;
    };