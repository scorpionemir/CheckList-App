import {
    startSyncListener,
} from "./syncManager";


let stopSync =
    null;


/*
|--------------------------------------------------------------------------
| Initialize Sync
|--------------------------------------------------------------------------
*/

export const initializeSync =
    () => {

        if (stopSync) {

            console.log(
                "Sync listener already initialized."
            );

            return;
        }


        stopSync =
            startSyncListener();


        console.log(
            "Sync listener initialized."
        );
    };


/*
|--------------------------------------------------------------------------
| Stop Sync
|--------------------------------------------------------------------------
*/

export const stopSyncManager =
    () => {

        if (!stopSync) {
            return;
        }


        stopSync();


        stopSync =
            null;


        console.log(
            "Sync listener stopped."
        );
    };