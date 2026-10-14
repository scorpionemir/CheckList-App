
const pool = require("../db/database");
const bcrypt = require("bcryptjs");

const VALID_ROLES = ["manager", "admin", "contractor"];

const ADDRESS_FIELDS = [
    "province",
    "city",
    "district",
    "street",
    "alley",
    "plaque",
    "postalCode",
];

const isValidDate = (value) => {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);

    if (year < 1900 || year > 2100) {
        return false;
    }

    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
};

const isValidUuid = (value) => {
    return (
        typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            value
        )
    );
};

const normalizeRequiredString = (value, maxLength = 200) => {
    if (typeof value !== "string") {
        return null;
    }

    const normalized = value.trim();

    if (!normalized || normalized.length > maxLength) {
        return null;
    }

    return normalized;
};

// Create a user and address atomically.
const createUser = async (req, res) => {
    const body = req.body || {};

    const {
        firstName,
        lastName,
        birthDate,
        fatherName,
        nationalId,
        mobile,
        address,
    } = body;

    const role =
        body.role === undefined ? "contractor" : body.role;

    const normalizedFirstName = normalizeRequiredString(firstName, 100);
    const normalizedLastName = normalizeRequiredString(lastName, 100);
    const normalizedFatherName = normalizeRequiredString(fatherName, 100);

    if (
        !normalizedFirstName ||
        !normalizedLastName ||
        !normalizedFatherName ||
        !isValidDate(birthDate) ||
        typeof nationalId !== "string" ||
        typeof mobile !== "string" ||
        !address ||
        typeof address !== "object" ||
        Array.isArray(address)
    ) {
        return res.status(400).json({
            message: "Please provide all required fields with valid values",
        });
    }

    if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({
        message: "Invalid user role",
    });
}

// A manager can create any supported account type.
// An admin can create contractor accounts only.
const allowedRolesForCreator =
    req.user.role === "manager"
        ? VALID_ROLES
        : req.user.role === "admin"
            ? ["contractor"]
            : [];

if (!allowedRolesForCreator.includes(role)) {
    return res.status(403).json({
        message: "You do not have permission to create this role",
    });
}

    const normalizedNationalId = nationalId.trim();
    const normalizedMobile = mobile.trim();

    if (!/^\d{10}$/.test(normalizedNationalId)) {
        return res.status(400).json({
            message: "National ID must contain exactly 10 digits",
        });
    }

    if (!/^09\d{9}$/.test(normalizedMobile)) {
        return res.status(400).json({
            message: "Mobile number must contain 11 digits and start with 09",
        });
    }

    const normalizedAddress = {};

    for (const field of ADDRESS_FIELDS) {
        const normalizedValue = normalizeRequiredString(
            address[field],
            200
        );

        if (!normalizedValue) {
            return res.status(400).json({
                message: `Address field "${field}" is required and must be valid`,
            });
        }

        normalizedAddress[field] = normalizedValue;
    }

    let client;

    try {
        const passwordHash = await bcrypt.hash(normalizedMobile, 12);

        client = await pool.connect();

        await client.query("BEGIN");

        const userResult = await client.query(
            `
            INSERT INTO users (
                username,
                password_hash,
                first_name,
                last_name,
                birth_date,
                father_name,
                national_id,
                mobile,
                role
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING
                id,
                username,
                first_name,
                last_name,
                national_id,
                mobile,
                role,
                is_active,
                created_at
            `,
            [
                normalizedNationalId,
                passwordHash,
                normalizedFirstName,
                normalizedLastName,
                birthDate,
                normalizedFatherName,
                normalizedNationalId,
                normalizedMobile,
                role,
            ]
        );

        const user = userResult.rows[0];

        await client.query(
            `
            INSERT INTO user_addresses (
                user_id,
                province,
                city,
                district,
                street,
                alley,
                plaque,
                postal_code
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
            [
                user.id,
                normalizedAddress.province,
                normalizedAddress.city,
                normalizedAddress.district,
                normalizedAddress.street,
                normalizedAddress.alley,
                normalizedAddress.plaque,
                normalizedAddress.postalCode,
            ]
        );

        await client.query(
            `
            INSERT INTO audit_logs (
                actor_id,
                action,
                target_type,
                target_id,
                details
            )
            VALUES ($1, $2, $3, $4, $5::jsonb)
            `,
            [
                req.user.userId,
                "user.created",
                "user",
                user.id,
                JSON.stringify({
                    role: user.role,
                    username: user.username,
                }),
            ]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            message: "User created successfully",
            user,
        });
    } catch (error) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Create user rollback error:", rollbackError);
            }
        }

        if (error.code === "23505") {
            return res.status(409).json({
                message:
                    "National ID, mobile number, or username already exists",
            });
        }

        if (
            error.code === "23514" ||
            error.code === "22P02" ||
            error.code === "22007" ||
            error.code === "22008" ||
            error.code === "22001"
        ) {
            return res.status(400).json({
                message: "Invalid user data",
            });
        }

        console.error("Error creating user:", error);

        return res.status(500).json({
            message: "Failed to create user",
        });
    } finally {
        if (client) {
            client.release();
        }
    }
};

// Deactivate an account without deleting historical records.
const deactivateUser = async (req, res) => {
    const { id } = req.params;
    const currentUserId = String(req.user.userId);
    const currentRole = req.user.role;

    if (!isValidUuid(id)) {
        return res.status(400).json({
            message: "Invalid user ID",
        });
    }

    if (id.toLowerCase() === currentUserId.toLowerCase()) {
        return res.status(400).json({
            message: "You cannot deactivate your own account",
        });
    }

    if (!["manager", "admin"].includes(currentRole)) {
        return res.status(403).json({
            message: "You do not have permission to deactivate accounts",
        });
    }

    let client;

    try {
        client = await pool.connect();

        await client.query("BEGIN");

        const targetResult = await client.query(
            `
            SELECT id, username, role, is_active
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (targetResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "User not found",
            });
        }

        const targetUser = targetResult.rows[0];

        if (
            targetUser.role === "manager" &&
            currentRole !== "manager"
        ) {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "Only a manager can deactivate a manager account",
            });
        }

        if (!VALID_ROLES.includes(targetUser.role)) {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "This account has an unsupported role",
            });
        }

        if (!targetUser.is_active) {
            await client.query("ROLLBACK");

            return res.status(200).json({
                message: "User is already inactive",
                user: {
                    id: targetUser.id,
                    role: targetUser.role,
                    is_active: false,
                },
            });
        }

        const updateResult = await client.query(
            `
            UPDATE users
            SET
                is_active = false,
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, username, role, is_active
            `,
            [id]
        );

        const updatedUser = updateResult.rows[0];

        await client.query(
            `
            INSERT INTO audit_logs (
                actor_id,
                action,
                target_type,
                target_id,
                details
            )
            VALUES ($1, $2, $3, $4, $5::jsonb)
            `,
            [
                currentUserId,
                "user.deactivated",
                "user",
                updatedUser.id,
                JSON.stringify({
                    username: updatedUser.username,
                    role: updatedUser.role,
                }),
            ]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            message: "User deactivated successfully",
            user: updatedUser,
        });
    } catch (error) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Deactivate user rollback error:",
                    rollbackError
                );
            }
        }

        console.error("Deactivate user error:", error);

        return res.status(500).json({
            message: "Failed to deactivate user",
        });
    } finally {
        if (client) {
            client.release();
        }
    }
};

module.exports = {
    createUser,
    deactivateUser,
};
