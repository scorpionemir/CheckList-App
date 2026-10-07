import { getToken } from "./authStorage";

import {
    enqueueSyncOperation,
    generateClientOperationId,
} from "./localDatabase";

import {
    isOnline,
} from "./network";

// const API_URL =
//     "http://10.0.2.2:3000/api";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL;

// const API_URL = "http://192.168.43.136:3000/api";

console.log("🔥 API URL:", API_URL);

if (!API_URL) {
    console.warn(
        "EXPO_PUBLIC_API_URL is not configured."
    );
}

const REQUEST_TIMEOUT =
    15000;


/*
|--------------------------------------------------------------------------
| ApiError
|--------------------------------------------------------------------------
*/

class ApiError extends Error {

    constructor(
        message,
        status = null,
        code = null
    ) {

        super(message);

        this.name =
            "ApiError";

        this.status =
            status;

        this.code =
            code;
    }
}


/*
|--------------------------------------------------------------------------
| HTTP Error Message
|--------------------------------------------------------------------------
*/

const getHttpErrorMessage = (
    status
) => {

    switch (status) {

        case 400:
            return "اطلاعات ارسال‌شده صحیح نیست.";

        case 401:
            return "نشست کاربری منقضی شده است.";

        case 403:
            return "دسترسی به این بخش مجاز نیست.";

        case 404:
            return "اطلاعات موردنظر پیدا نشد.";

        case 408:
            return "زمان درخواست به پایان رسید.";

        case 429:
            return "تعداد درخواست‌ها بیش از حد مجاز است.";

        case 500:
            return "خطای داخلی سرور رخ داده است.";

        case 502:
        case 503:
        case 504:
            return "سرور در دسترس نیست.";

        default:
            return "خطا در ارتباط با سرور.";
    }
};


/*
|--------------------------------------------------------------------------
| API Request
|--------------------------------------------------------------------------
*/

const apiRequest = async (
    endpoint,
    options = {}
) => {

    const token =
        await getToken();

    const controller =
        new AbortController();

    const timeoutId =
        setTimeout(
            () => {
                controller.abort();
            },
            REQUEST_TIMEOUT
        );

    try {

        console.log("========== API REQUEST ==========");
console.log("URL:", `${API_URL}${endpoint}`);
console.log("METHOD:", options.method || "GET");
console.log("BODY:", options.body);
console.log("TOKEN:", token ? "YES" : "NO");
console.log("=================================");

        const response =
            await fetch(
                `${API_URL}${endpoint}`,
                {
                    ...options,

                    signal:
                        controller.signal,

                    headers: {

                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                Authorization:
                                    `Bearer ${token}`,
                            }
                            : {}),

                        ...(options.headers || {}),
                    },
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (error) {

            data = null;
        }


        if (!response.ok) {
    throw new ApiError(
        data?.message ||
            getHttpErrorMessage(
                response.status
            ),
        response.status,
        data?.code || null
    );
}


        return data;

    } catch (error) {

        if (
            error?.name ===
            "AbortError"
        ) {

            throw new ApiError(
                "زمان اتصال به سرور به پایان رسید.",
                null,
                "TIMEOUT"
            );
        }


        if (
            error instanceof ApiError
        ) {

            throw error;
        }


        if (
            error?.message ===
                "Network request failed" ||

            error?.name ===
                "TypeError"
        ) {

            throw new ApiError(
                "ارتباط با سرور برقرار نشد. اتصال شبکه و روشن بودن سرور را بررسی کنید.",
                null,
                "NETWORK_ERROR"
            );
        }


        throw new ApiError(
            "خطای غیرمنتظره در ارتباط با سرور.",
            null,
            "UNKNOWN_ERROR"
        );

    } finally {

        clearTimeout(
            timeoutId
        );
    }
};


/*
|--------------------------------------------------------------------------
| تشخیص خطاهای موقتی
|--------------------------------------------------------------------------
*/

const isTemporaryApiError = (
    error
) => {

    if (!error) {
        return false;
    }


    if (!error.status) {
        return true;
    }


    if (
        error.status === 408 ||
        error.status === 429
    ) {

        return true;
    }


    if (
        error.status >= 500
    ) {

        return true;
    }


    return false;
};


/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export const loginUser = async (
    username,
    password
) => {

    return apiRequest(
        "/auth/login",
        {
            method: "POST",

            body:
                JSON.stringify({
                    username,
                    password,
                }),
        }
    );
};


/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

export const getCurrentUser = async () => {

    return apiRequest(
        "/auth/me",
        {
            method: "GET",
        }
    );
};


/*
|--------------------------------------------------------------------------
| Create Checklist
|
| options:
|
| userId
| skipQueue
| clientOperationId
|--------------------------------------------------------------------------
*/

export const createChecklist = async (
    payload,
    options = {}
) => {

    if (!payload) {

        throw new ApiError(
            "اطلاعات چک‌لیست ارسال نشده است.",
            400,
            "INVALID_PAYLOAD"
        );
    }


    const {
        userId,
        skipQueue = false,
        clientOperationId:
            providedClientOperationId,
    } = options;


    /*
    |--------------------------------------------------------------------------
    | Client Operation ID
    |--------------------------------------------------------------------------
    */

    const clientOperationId =
        providedClientOperationId ||
        generateClientOperationId();


    /*
    |--------------------------------------------------------------------------
    | حالت Sync
    |
    | اگر Sync Manager این تابع را صدا زده،
    | نباید دوباره وارد Queue شود.
    |--------------------------------------------------------------------------
    */

    if (skipQueue) {

        return apiRequest(
            "/checklists",
            {
                method: "POST",

                body:
                    JSON.stringify({

                        ...payload,

                        clientOperationId,
                    }),
            }
        );
    }


    /*
    |--------------------------------------------------------------------------
    | userId برای Queue لازم است
    |--------------------------------------------------------------------------
    */

    if (!userId) {

        throw new ApiError(
            "شناسه کاربر برای ثبت چک‌لیست پیدا نشد.",
            null,
            "USER_ID_REQUIRED"
        );
    }


    /*
    |--------------------------------------------------------------------------
    | بررسی اتصال
    |--------------------------------------------------------------------------
    */

    const online =
        await isOnline();


    /*
    |--------------------------------------------------------------------------
    | Offline
    |--------------------------------------------------------------------------
    */

    if (!online) {

        const queueItem =
            await enqueueSyncOperation({

                userId,

                operationType:
                    "create_checklist",

                entityType:
                    "checklist",

                entityId:
                    null,

                clientOperationId,

                payload,
            });


        return {

            queued: true,

            offline: true,

            clientOperationId,

            queueId:
                queueItem?.id ||
                null,

            message:
                "چک‌لیست ذخیره شد و پس از اتصال به اینترنت ارسال خواهد شد.",
        };
    }


    /*
    |--------------------------------------------------------------------------
    | Online → ارسال مستقیم
    |--------------------------------------------------------------------------
    */

    try {

        return await apiRequest(
            "/checklists",
            {
                method: "POST",

                body:
                    JSON.stringify({

                        ...payload,

                        clientOperationId,
                    }),
            }
        );

    } catch (error) {


        /*
        |--------------------------------------------------------------------------
        | خطای موقتی
        |
        | اگر سرور موقتاً در دسترس نبود،
        | عملیات را وارد Queue می‌کنیم.
        |--------------------------------------------------------------------------
        */

        if (
            isTemporaryApiError(
                error
            )
        ) {

            const queueItem =
                await enqueueSyncOperation({

                    userId,

                    operationType:
                        "create_checklist",

                    entityType:
                        "checklist",

                    entityId:
                        null,

                    clientOperationId,

                    payload,
                });


            return {

                queued: true,

                offline: false,

                retryable: true,

                clientOperationId,

                queueId:
                    queueItem?.id ||
                    null,

                message:
                    "ارتباط با سرور برقرار نشد. اطلاعات ذخیره شد و دوباره ارسال خواهد شد.",
            };
        }


        /*
        |--------------------------------------------------------------------------
        | خطای غیرموقتی
        |--------------------------------------------------------------------------
        */

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| Get My Checklists
|--------------------------------------------------------------------------
*/

export const getMyChecklists =
    async () => {

        return apiRequest(
            "/checklists",
            {
                method: "GET",
            }
        );
    };


/*
|--------------------------------------------------------------------------
| Get Checklists By Type
|--------------------------------------------------------------------------
*/

export const getMyChecklistsByType =
    async (
        checklistTypeId
    ) => {

        if (!checklistTypeId) {

            throw new Error(
                "checklistTypeId is required"
            );
        }


        return apiRequest(
            `/checklists/type/${checklistTypeId}`,
            {
                method: "GET",
            }
        );
    };


/*
|--------------------------------------------------------------------------
| Get Checklist By ID
|--------------------------------------------------------------------------
*/

export const getMyChecklistById =
    async (
        id
    ) => {

        if (!id) {

            throw new Error(
                "Checklist id is required"
            );
        }


        return apiRequest(
            `/checklists/${id}`,
            {
                method: "GET",
            }
        );
    };

/*
|--------------------------------------------------------------------------
| Set Checklist Edit Permission
|
| فقط Manager باید بتواند این API را صدا بزند.
|--------------------------------------------------------------------------
*/

export const setChecklistEditPermission =
    async (
        id,
        allowed
    ) => {
        if (!id) {
            throw new ApiError(
                "شناسه چک‌لیست مشخص نیست.",
                400,
                "CHECKLIST_ID_REQUIRED"
            );
        }

        if (
            typeof allowed !==
            "boolean"
        ) {
            throw new ApiError(
                "مقدار مجوز ویرایش نامعتبر است.",
                400,
                "INVALID_EDIT_PERMISSION"
            );
        }

        return apiRequest(
            `/checklists/${id}/edit-permission`,
            {
                method: "PATCH",

                body: JSON.stringify({
                    allowed,
                }),
            }
        );
    };


/*
|--------------------------------------------------------------------------
| Update Checklist
|
| این API برای ویرایش چک‌لیستی است که Manager
| قبلاً اجازه ویرایش آن را داده است.
|--------------------------------------------------------------------------
*/

export const updateChecklist =
    async (
        id,
        payload
    ) => {
        if (!id) {
            throw new ApiError(
                "شناسه چک‌لیست مشخص نیست.",
                400,
                "CHECKLIST_ID_REQUIRED"
            );
        }

        if (!payload) {
            throw new ApiError(
                "اطلاعات چک‌لیست ارسال نشده است.",
                400,
                "INVALID_PAYLOAD"
            );
        }

        return apiRequest(
            `/checklists/${id}`,
            {
                method: "PUT",

                body: JSON.stringify(
                    payload
                ),
            }
        );
    };

export const getAllSubmittedChecklists =
    async () => {

        return apiRequest(
            "/checklists/manager/all"
        );
    };


/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export {
    ApiError,
};

export default apiRequest;