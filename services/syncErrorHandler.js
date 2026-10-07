import { ApiError } from "./api";


// ============================================================
// Error Types
// ============================================================

export const SYNC_ERROR_TYPES = {
    NETWORK: "network",
    SERVER: "server",
    VALIDATION: "validation",
    AUTHENTICATION: "authentication",
    NOT_FOUND: "not_found",
    CONFLICT: "conflict",
    UNKNOWN: "unknown",
};


// ============================================================
// Error Classification
// ============================================================

export const classifySyncError = (
    error
) => {

    // ========================================================
    // Network Errors
    // ========================================================

    if (
        !error
    ) {

        return {
            type:
                SYNC_ERROR_TYPES.UNKNOWN,

            retryable:
                true,

            permanent:
                false,

            message:
                "خطای نامشخصی هنگام همگام‌سازی رخ داد.",
        };
    }


    const errorMessage =
        String(
            error?.message ||
            ""
        ).toLowerCase();


    // ========================================================
    // ApiError
    // ========================================================

    if (
        error instanceof ApiError
    ) {

        const status =
            Number(
                error.status
            ) || 0;


        // ====================================================
        // Authentication
        // ====================================================

        if (
            status === 401 ||
            status === 403
        ) {

            return {
                type:
                    SYNC_ERROR_TYPES.AUTHENTICATION,

                retryable:
                    false,

                permanent:
                    true,

                message:
                    "احراز هویت انجام نشد. لطفاً دوباره وارد حساب کاربری شوید.",

                status,
            };
        }


        // ====================================================
        // Validation
        // ====================================================

        if (
            status === 400 ||
            status === 422
        ) {

            return {
                type:
                    SYNC_ERROR_TYPES.VALIDATION,

                retryable:
                    false,

                permanent:
                    true,

                message:
                    "اطلاعات چک‌لیست معتبر نیست و امکان ثبت آن وجود ندارد.",

                status,
            };
        }


        // ====================================================
        // Not Found
        // ====================================================

        if (
            status === 404
        ) {

            return {
                type:
                    SYNC_ERROR_TYPES.NOT_FOUND,

                retryable:
                    false,

                permanent:
                    true,

                message:
                    "منبع موردنظر در سرور پیدا نشد.",

                status,
            };
        }


        // ====================================================
        // Conflict
        // ====================================================

        if (
            status === 409
        ) {

            return {
                type:
                    SYNC_ERROR_TYPES.CONFLICT,

                retryable:
                    false,

                permanent:
                    false,

                message:
                    "این عملیات قبلاً در سرور ثبت شده یا با اطلاعات موجود تداخل دارد.",

                status,
            };
        }


        // ====================================================
        // Server Errors
        // ====================================================

        if (
            status >= 500 &&
            status <= 599
        ) {

            return {
                type:
                    SYNC_ERROR_TYPES.SERVER,

                retryable:
                    true,

                permanent:
                    false,

                message:
                    "سرور موقتاً با مشکل مواجه شده است.",

                status,
            };
        }
    }


    // ========================================================
    // Network Error Detection
    // ========================================================

    const networkErrorPatterns = [

        "network request failed",

        "network error",

        "failed to fetch",

        "fetch failed",

        "timeout",

        "timed out",

        "econnreset",

        "enotfound",

        "eai_again",

        "socket",

        "connection",

        "internet",

        "offline",
    ];


    const isNetworkError =
        networkErrorPatterns.some(
            (pattern) =>
                errorMessage.includes(
                    pattern
                )
        );


    if (
        isNetworkError
    ) {

        return {
            type:
                SYNC_ERROR_TYPES.NETWORK,

            retryable:
                true,

            permanent:
                false,

            message:
                "ارتباط با سرور برقرار نشد. عملیات برای تلاش مجدد نگه داشته شد.",
        };
    }


    // ========================================================
    // Unknown Error
    // ========================================================

    return {

        type:
            SYNC_ERROR_TYPES.UNKNOWN,

        retryable:
            true,

        permanent:
            false,

        message:
            error?.message ||
            "خطای نامشخصی هنگام همگام‌سازی رخ داد.",
    };
};