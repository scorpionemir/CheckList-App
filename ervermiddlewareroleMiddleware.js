[1mdiff --git a/server/controllers/usersController.js b/server/controllers/usersController.js[m
[1mindex 33442ad..a1f6628 100644[m
[1m--- a/server/controllers/usersController.js[m
[1m+++ b/server/controllers/usersController.js[m
[36m@@ -1,126 +1,450 @@[m
[32m+[m
 const pool = require("../db/database");[m
 const bcrypt = require("bcryptjs");[m
 [m
[32m+[m[32mconst VALID_ROLES = ["manager", "admin", "contractor"];[m
[32m+[m
[32m+[m[32mconst ADDRESS_FIELDS = [[m
[32m+[m[32m    "province",[m
[32m+[m[32m    "city",[m
[32m+[m[32m    "district",[m
[32m+[m[32m    "street",[m
[32m+[m[32m    "alley",[m
[32m+[m[32m    "plaque",[m
[32m+[m[32m    "postalCode",[m
[32m+[m[32m];[m
[32m+[m
[32m+[m[32mconst isValidDate = (value) => {[m
[32m+[m[32m    if ([m
[32m+[m[32m        typeof value !== "string" ||[m
[32m+[m[32m        !/^\d{4}-\d{2}-\d{2}$/.test(value)[m
[32m+[m[32m    ) {[m
[32m+[m[32m        return false;[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    const [year, month, day] = value.split("-").map(Number);[m
[32m+[m
[32m+[m[32m    if (year < 1900 || year > 2100) {[m
[32m+[m[32m        return false;[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    const date = new Date(Date.UTC(year, month - 1, day));[m
[32m+[m
[32m+[m[32m    return ([m
[32m+[m[32m        date.getUTCFullYear() === year &&[m
[32m+[m[32m        date.getUTCMonth() === month - 1 &&[m
[32m+[m[32m        date.getUTCDate() === day[m
[32m+[m[32m    );[m
[32m+[m[32m};[m
[32m+[m
[32m+[m[32mconst isValidUuid = (value) => {[m
[32m+[m[32m    return ([m
[32m+[m[32m        typeof value === "string" &&[m
[32m+[m[32m        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test([m
[32m+[m[32m            value[m
[32m+[m[32m        )[m
[32m+[m[32m    );[m
[32m+[m[32m};[m
[32m+[m
[32m+[m[32mconst normalizeRequiredString = (value, maxLength = 200) => {[m
[32m+[m[32m    if (typeof value !== "string") {[m
[32m+[m[32m        return null;[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    const normalized = value.trim();[m
[32m+[m
[32m+[m[32m    if (!normalized || normalized.length > maxLength) {[m
[32m+[m[32m        return null;[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    return normalized;[m
[32m+[m[32m};[m
[32m+[m
[32m+[m[32m// Create a user and address atomically.[m
 const createUser = async (req, res) => {[m
[32m+[m[32m    const body = req.body || {};[m
[32m+[m
[32m+[m[32m    const {[m
[32m+[m[32m        firstName,[m
[32m+[m[32m        lastName,[m
[32m+[m[32m        birthDate,[m
[32m+[m[32m        fatherName,[m
[32m+[m[32m        nationalId,[m
[32m+[m[32m        mobile,[m
[32m+[m[32m        address,[m
[32m+[m[32m    } = body;[m
[32m+[m
[32m+[m[32m    const role =[m
[32m+[m[32m        body.role === undefined ? "contractor" : body.role;[m
[32m+[m
[32m+[m[32m    const normalizedFirstName = normalizeRequiredString(firstName, 100);[m
[32m+[m[32m    const normalizedLastName = normalizeRequiredString(lastName, 100);[m
[32m+[m[32m    const normalizedFatherName = normalizeRequiredString(fatherName, 100);[m
[32m+[m
[32m+[m[32m    if ([m
[32m+[m[32m        !normalizedFirstName ||[m
[32m+[m[32m        !normalizedLastName ||[m
[32m+[m[32m        !normalizedFatherName ||[m
[32m+[m[32m        !isValidDate(birthDate) ||[m
[32m+[m[32m        typeof nationalId !== "string" ||[m
[32m+[m[32m        typeof mobile !== "string" ||[m
[32m+[m[32m        !address ||[m
[32m+[m[32m        typeof address !== "object" ||[m
[32m+[m[32m        Array.isArray(address)[m
[32m+[m[32m    ) {[m
[32m+[m[32m        return res.status(400).json({[m
[32m+[m[32m            message: "Please provide all required fields with valid values",[m
[32m+[m[32m        });[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    if (!VALID_ROLES.includes(role)) {[m
[32m+[m[32m    return res.status(400).json({[m
[32m+[m[32m        message: "Invalid user role",[m
[32m+[m[32m    });[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m// A manager can create any supported account type.[m
[32m+[m[32m// An admin can create contractor accounts only.[m
[32m+[m[32mconst allowedRolesForCreator =[m
[32m+[m[32m    req.user.role === "manager"[m
[32m+[m[32m        ? VALID_ROLES[m
[32m+[m[32m        : req.user.role === "admin"[m
[32m+[m[32m            ? ["contractor"][m
[32m+[m[32m            : [];[m
[32m+[m
[32m+[m[32mif (!allowedRolesForCreator.includes(role)) {[m
[32m+[m[32m    return res.status(403).json({[m
[32m+[m[32m        message: "You do not have permission to create this role",[m
[32m+[m[32m    });[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m    const normalizedNationalId = nationalId.trim();[m
[32m+[m[32m    const normalizedMobile = mobile.trim();[m
[32m+[m
[32m+[m[32m    if (!/^\d{10}$/.test(normalizedNationalId)) {[m
[32m+[m[32m        return res.status(400).json({[m
[32m+[m[32m            message: "National ID must contain exactly 10 digits",[m
[32m+[m[32m        });[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    if (!/^09\d{9}$/.test(normalizedMobile)) {[m
[32m+[m[32m        return res.status(400).json({[m
[32m+[m[32m            message: "Mobile number must contain 11 digits and start with 09",[m
[32m+[m[32m        });[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    const normalizedAddress = {};[m
[32m+[m
[32m+[m[32m    for (const field of ADDRESS_FIELDS) {[m
[32m+[m[32m        const normalizedValue = normalizeRequiredString([m
[32m+[m[32m            address[field],[m
[32m+[m[32m            200[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        if (!normalizedValue) {[m
[32m+[m[32m            return res.status(400).json({[m
[32m+[m[32m                message: `Address field "${field}" is required and must be valid`,[m
[32m+[m[32m            });[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        normalizedAddress[field] = normalizedValue;[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    let client;[m
[32m+[m
     try {[m
[31m-        const {[m
[31m-            firstName,[m
[31m-            lastName,[m
[31m-            birthDate,[m
[31m-            fatherName,[m
[31m-            nationalId,[m
[31m-            mobile,[m
[31m-            address[m
[31m-        } = req.body;[m
[32m+[m[32m        const passwordHash = await bcrypt.hash(normalizedMobile, 12);[m
[32m+[m
[32m+[m[32m        client = await pool.connect();[m
[32m+[m
[32m+[m[32m        await client.query("BEGIN");[m
[32m+[m
[32m+[m[32m        const userResult = await client.query([m
[32m+[m[32m            `[m
[32m+[m[32m            INSERT INTO users ([m
[32m+[m[32m                username,[m
[32m+[m[32m                password_hash,[m
[32m+[m[32m                first_name,[m
[32m+[m[32m                last_name,[m
[32m+[m[32m                birth_date,[m
[32m+[m[32m                father_name,[m
[32m+[m[32m                national_id,[m
[32m+[m[32m                mobile,[m
[32m+[m[32m                role[m
[32m+[m[32m            )[m
[32m+[m[32m            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)[m
[32m+[m[32m            RETURNING[m
[32m+[m[32m                id,[m
[32m+[m[32m                username,[m
[32m+[m[32m                first_name,[m
[32m+[m[32m                last_name,[m
[32m+[m[32m                national_id,[m
[32m+[m[32m                mobile,[m
[32m+[m[32m                role,[m
[32m+[m[32m                is_active,[m
[32m+[m[32m                created_at[m
[32m+[m[32m            `,[m
[32m+[m[32m            [[m
[32m+[m[32m                normalizedNationalId,[m
[32m+[m[32m                passwordHash,[m
[32m+[m[32m                normalizedFirstName,[m
[32m+[m[32m                normalizedLastName,[m
[32m+[m[32m                birthDate,[m
[32m+[m[32m                normalizedFatherName,[m
[32m+[m[32m                normalizedNationalId,[m
[32m+[m[32m                normalizedMobile,[m
[32m+[m[32m                role,[m
[32m+[m[32m            ][m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        const user = userResult.rows[0];[m
[32m+[m
[32m+[m[32m        await client.query([m
[32m+[m[32m            `[m
[32m+[m[32m            INSERT INTO user_addresses ([m
[32m+[m[32m                user_id,[m
[32m+[m[32m                province,[m
[32m+[m[32m                city,[m
[32m+[m[32m                district,[m
[32m+[m[32m                street,[m
[32m+[m[32m                alley,[m
[32m+[m[32m                plaque,[m
[32m+[m[32m                postal_code[m
[32m+[m[32m            )[m
[32m+[m[32m            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)[m
[32m+[m[32m            `,[m
[32m+[m[32m            [[m
[32m+[m[32m                user.id,[m
[32m+[m[32m                normalizedAddress.province,[m
[32m+[m[32m                normalizedAddress.city,[m
[32m+[m[32m                normalizedAddress.district,[m
[32m+[m[32m                normalizedAddress.street,[m
[32m+[m[32m                normalizedAddress.alley,[m
[32m+[m[32m                normalizedAddress.plaque,[m
[32m+[m[32m                normalizedAddress.postalCode,[m
[32m+[m[32m            ][m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        await client.query([m
[32m+[m[32m            `[m
[32m+[m[32m            INSERT INTO audit_logs ([m
[32m+[m[32m                actor_id,[m
[32m+[m[32m                action,[m
[32m+[m[32m                target_type,[m
[32m+[m[32m                target_id,[m
[32m+[m[32m                details[m
[32m+[m[32m            )[m
[32m+[m[32m            VALUES ($1, $2, $3, $4, $5::jsonb)[m
[32m+[m[32m            `,[m
[32m+[m[32m            [[m
[32m+[m[32m                req.user.userId,[m
[32m+[m[32m                "user.created",[m
[32m+[m[32m                "user",[m
[32m+[m[32m                user.id,[m
[32m+[m[32m                JSON.stringify({[m
[32m+[m[32m                    role: user.role,[m
[32m+[m[32m                    username: user.username,[m
[32m+[m[32m                }),[m
[32m+[m[32m            ][m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        await client.query("COMMIT");[m
[32m+[m
[32m+[m[32m        return res.status(201).json({[m
[32m+[m[32m            message: "User created successfully",[m
[32m+[m[32m            user,[m
[32m+[m[32m        });[m
[32m+[m[32m    } catch (error) {[m
[32m+[m[32m        if (client) {[m
[32m+[m[32m            try {[m
[32m+[m[32m                await client.query("ROLLBACK");[m
[32m+[m[32m            } catch (rollbackError) {[m
[32m+[m[32m                console.error("Create user rollback error:", rollbackError);[m
[32m+[m[32m            }[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        if (error.code === "23505") {[m
[32m+[m[32m            return res.status(409).json({[m
[32m+[m[32m                message:[m
[32m+[m[32m                    "National ID, mobile number, or username already exists",[m
[32m+[m[32m            });[m
[32m+[m[32m        }[m
 [m
         if ([m
[31m-            !firstName ||[m
[31m-            !lastName ||[m
[31m-            !birthDate ||[m
[31m-            !fatherName ||[m
[31m-            !nationalId ||[m
[31m-            !mobile ||[m
[31m-            !address[m
[32m+[m[32m            error.code === "23514" ||[m
[32m+[m[32m            error.code === "22P02" ||[m
[32m+[m[32m            error.code === "22007" ||[m
[32m+[m[32m            error.code === "22008" ||[m
[32m+[m[32m            error.code === "22001"[m
         ) {[m
             return res.status(400).json({[m
[31m-                message: "All required fields must be provided"[m
[32m+[m[32m                message: "Invalid user data",[m
             });[m
         }[m
 [m
[31m-        const existingUser = await pool.query([m
[31m-            `SELECT id[m
[31m-             FROM users[m
[31m-             WHERE national_id = $1 OR mobile = $2`,[m
[31m-            [nationalId, mobile][m
[32m+[m[32m        console.error("Error creating user:", error);[m
[32m+[m
[32m+[m[32m        return res.status(500).json({[m
[32m+[m[32m            message: "Failed to create user",[m
[32m+[m[32m        });[m
[32m+[m[32m    } finally {[m
[32m+[m[32m        if (client) {[m
[32m+[m[32m            client.release();[m
[32m+[m[32m        }[m
[32m+[m[32m    }[m
[32m+[m[32m};[m
[32m+[m
[32m+[m[32m// Deactivate an account without deleting historical records.[m
[32m+[m[32mconst deactivateUser = async (req, res) => {[m
[32m+[m[32m    const { id } = req.params;[m
[32m+[m[32m    const currentUserId = String(req.user.userId);[m
[32m+[m[32m    const currentRole = req.user.role;[m
[32m+[m
[32m+[m[32m    if (!isValidUuid(id)) {[m
[32m+[m[32m        return res.status(400).json({[m
[32m+[m[32m            message: "Invalid user ID",[m
[32m+[m[32m        });[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    if (id.toLowerCase() === currentUserId.toLowerCase()) {[m
[32m+[m[32m        return res.status(400).json({[m
[32m+[m[32m            message: "You cannot deactivate your own account",[m
[32m+[m[32m        });[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    if (!["manager", "admin"].includes(currentRole)) {[m
[32m+[m[32m        return res.status(403).json({[m
[32m+[m[32m            message: "You do not have permission to deactivate accounts",[m
[32m+[m[32m        });[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    let client;[m
[32m+[m
[32m+[m[32m    try {[m
[32m+[m[32m        client = await pool.connect();[m
[32m+[m
[32m+[m[32m        await client.query("BEGIN");[m
[32m+[m
[32m+[m[32m        const targetResult = await client.query([m
[32m+[m[32m            `[m
[32m+[m[32m            SELECT id, username, role, is_active[m
[32m+[m[32m            FROM users[m
[32m+[m[32m            WHERE id = $1[m
[32m+[m[32m            FOR UPDATE[m
[32m+[m[32m            `,[m
[32m+[m[32m            [id][m
         );[m
 [m
[31m-        if (existingUser.rows.length > 0) {[m
[31m-            return res.status(409).json({[m
[31m-                message: "National ID or mobile number already exists"[m
[32m+[m[32m        if (targetResult.rows.length === 0) {[m
[32m+[m[32m            await client.query("ROLLBACK");[m
[32m+[m
[32m+[m[32m            return res.status(404).json({[m
[32m+[m[32m                message: "User not found",[m
             });[m
         }[m
 [m
[31m-        const passwordHash = await bcrypt.hash(mobile, 10);[m
[31m-[m
[31m-        const client = await pool.connect();[m
[31m-[m
[31m-        try {[m
[31m-            await client.query("BEGIN");[m
[31m-[m
[31m-            const userResult = await client.query([m
[31m-                `INSERT INTO users[m
[31m-                ([m
[31m-                    username,[m
[31m-                    password_hash,[m
[31m-                    first_name,[m
[31m-                    last_name,[m
[31m-                    birth_date,[m
[31m-                    father_name,[m
[31m-                    national_id,[m
[31m-                    mobile[m
[31m-                )[m
[31m-                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)[m
[31m-                RETURNING id, username, first_name, last_name, national_id, mobile, is_active`,[m
[31m-                [[m
[31m-                    nationalId,[m
[31m-                    passwordHash,[m
[31m-                    firstName,[m
[31m-                    lastName,[m
[31m-                    birthDate,[m
[31m-                    fatherName,[m
[31m-                    nationalId,[m
[31m-                    mobile[m
[31m-                ][m
[31m-            );[m
[31m-[m
[31m-            const user = userResult.rows[0];[m
[31m-[m
[31m-            await client.query([m
[31m-                `INSERT INTO user_addresses[m
[31m-                ([m
[31m-                    user_id,[m
[31m-                    province,[m
[31m-                    city,[m
[31m-                    district,[m
[31m-                    street,[m
[31m-                    alley,[m
[31m-                    plaque,[m
[31m-                    postal_code[m
[31m-                )[m
[31m-                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,[m
[31m-                [[m
[31m-                    user.id,[m
[31m-                    address.province,[m
[31m-                    address.city,[m
[31m-                    address.district,[m
[31m-                    address.street,[m
[31m-                    address.alley,[m
[31m-                    address.plaque,[m
[31m-                    address.postalCode[m
[31m-                ][m
[31m-            );[m
[31m-[m
[31m-            await client.query("COMMIT");[m
[31m-[m
[31m-            res.status(201).json({[m
[31m-                message: "User created successfully",[m
[31m-                user[m
[32m+[m[32m        const targetUser = targetResult.rows[0];[m
[32m+[m
[32m+[m[32m        if ([m
[32m+[m[32m            targetUser.role === "manager" &&[m
[32m+[m[32m            currentRole !== "manager"[m
[32m+[m[32m        ) {[m
[32m+[m[32m            await client.query("ROLLBACK");[m
[32m+[m
[32m+[m[32m            return res.status(403).json({[m
[32m+[m[32m                message: "Only a manager can deactivate a manager account",[m
             });[m
[31m-        } catch (error) {[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        if (!VALID_ROLES.includes(targetUser.role)) {[m
             await client.query("ROLLBACK");[m
[31m-            throw error;[m
[31m-        } finally {[m
[31m-            client.release();[m
[32m+[m
[32m+[m[32m            return res.status(403).json({[m
[32m+[m[32m                message: "This account has an unsupported role",[m
[32m+[m[32m            });[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        if (!targetUser.is_active) {[m
[32m+[m[32m            await client.query("ROLLBACK");[m
[32m+[m
[32m+[m[32m            return res.status(200).json({[m
[32m+[m[32m                message: "User is already inactive",[m
[32m+[m[32m                user: {[m
[32m+[m[32m                    id: targetUser.id,[m
[32m+[m[32m                    role: targetUser.role,[m
[32m+[m[32m                    is_active: false,[m
[32m+[m[32m                },[m
[32m+[m[32m            });[m
         }[m
[32m+[m
[32m+[m[32m        const updateResult = await client.query([m
[32m+[m[32m            `[m
[32m+[m[32m            UPDATE users[m
[32m+[m[32m            SET[m
[32m+[m[32m                is_active = false,[m
[32m+[m[32m                updated_at = NOW()[m
[32m+[m[32m            WHERE id = $1[m
[32m+[m[32m            RETURNING id, username, role, is_active[m
[32m+[m[32m            `,[m
[32m+[m[32m            [id][m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        const updatedUser = updateResult.rows[0];[m
[32m+[m
[32m+[m[32m        await client.query([m
[32m+[m[32m            `[m
[32m+[m[32m            INSERT INTO audit_logs ([m
[32m+[m[32m                actor_id,[m
[32m+[m[32m                action,[m
[32m+[m[32m                target_type,[m
[32m+[m[32m                target_id,[m
[32m+[m[32m                details[m
[32m+[m[32m            )[m
[32m+[m[32m            VALUES ($1, $2, $3, $4, $5::jsonb)[m
[32m+[m[32m            `,[m
[32m+[m[32m            [[m
[32m+[m[32m                currentUserId,[m
[32m+[m[32m                "user.deactivated",[m
[32m+[m[32m                "user",[m
[32m+[m[32m                updatedUser.id,[m
[32m+[m[32m                JSON.stringify({[m
[32m+[m[32m                    username: updatedUser.username,[m
[32m+[m[32m                    role: updatedUser.role,[m
[32m+[m[32m                }),[m
[32m+[m[32m            ][m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        await client.query("COMMIT");[m
[32m+[m
[32m+[m[32m        return res.status(200).json({[m
[32m+[m[32m            message: "User deactivated successfully",[m
[32m+[m[32m            user: updatedUser,[m
[32m+[m[32m        });[m
     } catch (error) {[m
[31m-        console.error("Error creating user:", error);[m
[32m+[m[32m        if (client) {[m
[32m+[m[32m            try {[m
[32m+[m[32m                await client.query("ROLLBACK");[m
[32m+[m[32m            } catch (rollbackError) {[m
[32m+[m[32m                console.error([m
[32m+[m[32m                    "Deactivate user rollback error:",[m
[32m+[m[32m                    rollbackError[m
[32m+[m[32m                );[m
[32m+[m[32m            }[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        console.error("Deactivate user error:", error);[m
 [m
[31m-        res.status(500).json({[m
[31m-            message: "Failed to create user"[m
[32m+[m[32m        return res.status(500).json({[m
[32m+[m[32m            message: "Failed to deactivate user",[m
         });[m
[32m+[m[32m    } finally {[m
[32m+[m[32m        if (client) {[m
[32m+[m[32m            client.release();[m
[32m+[m[32m        }[m
     }[m
 };[m
 [m
 module.exports = {[m
[31m-    createUser[m
[31m-};[m
\ No newline at end of file[m
[32m+[m[32m    createUser,[m
[32m+[m[32m    deactivateUser,[m
[32m+[m[32m};[m
[1mdiff --git a/server/routes/users.js b/server/routes/users.js[m
[1mindex 996c027..97fb784 100644[m
[1m--- a/server/routes/users.js[m
[1m+++ b/server/routes/users.js[m
[36m@@ -1,32 +1,66 @@[m
[32m+[m
 const express = require("express");[m
[31m-const pool = require("../db/database");[m
 [m
[32m+[m[32mconst pool = require("../db/database");[m
 const authMiddleware = require("../middleware/authMiddleware");[m
[31m-const managerMiddleware = require("../middleware/managerMiddleware");[m
[32m+[m[32mconst roleMiddleware = require("../middleware/roleMiddleware");[m
 [m
 const {[m
[31m-    createUser[m
[32m+[m[32m    createUser,[m
[32m+[m[32m    deactivateUser,[m
 } = require("../controllers/usersController");[m
 [m
 const router = express.Router();[m
 [m
[32m+[m[32mconst VALID_ROLES = ["manager", "admin", "contractor"];[m
[32m+[m[32mconst VALID_STATUSES = ["active", "inactive"];[m
 [m
[31m-// فقط Manager می‌تواند User جدید بسازد[m
[32m+[m[32m// Create accounts. The controller validates the requested role and data.[m
 router.post([m
     "/",[m
     authMiddleware,[m
[31m-    managerMiddleware,[m
[32m+[m[32m    roleMiddleware("manager", "admin"),[m
     createUser[m
 );[m
 [m
[31m-[m
[31m-// فقط Manager می‌تواند لیست کاربران را ببیند[m
[32m+[m[32m// List accounts with optional status and role filters.[m
 router.get([m
     "/",[m
     authMiddleware,[m
[31m-    managerMiddleware,[m
[32m+[m[32m    roleMiddleware("manager", "admin"),[m
     async (req, res) => {[m
         try {[m
[32m+[m[32m            const { status, role } = req.query;[m
[32m+[m
[32m+[m[32m            if (status && !VALID_STATUSES.includes(status)) {[m
[32m+[m[32m                return res.status(400).json({[m
[32m+[m[32m                    message: "Invalid status filter",[m
[32m+[m[32m                });[m
[32m+[m[32m            }[m
[32m+[m
[32m+[m[32m            if (role && !VALID_ROLES.includes(role)) {[m
[32m+[m[32m                return res.status(400).json({[m
[32m+[m[32m                    message: "Invalid role filter",[m
[32m+[m[32m                });[m
[32m+[m[32m            }[m
[32m+[m
[32m+[m[32m            const conditions = [];[m
[32m+[m[32m            const values = [];[m
[32m+[m
[32m+[m[32m            if (status) {[m
[32m+[m[32m                values.push(status === "active");[m
[32m+[m[32m                conditions.push(`is_active = $${values.length}`);[m
[32m+[m[32m            }[m
[32m+[m
[32m+[m[32m            if (role) {[m
[32m+[m[32m                values.push(role);[m
[32m+[m[32m                conditions.push(`role = $${values.length}`);[m
[32m+[m[32m            }[m
[32m+[m
[32m+[m[32m            const whereClause = conditions.length[m
[32m+[m[32m                ? `WHERE ${conditions.join(" AND ")}`[m
[32m+[m[32m                : "";[m
[32m+[m
             const result = await pool.query([m
                 `[m
                 SELECT[m
[36m@@ -34,26 +68,38 @@[m [mrouter.get([m
                     username,[m
                     first_name,[m
                     last_name,[m
[31m-                    is_active,[m
[32m+[m[32m                    national_id,[m
[32m+[m[32m                    mobile,[m
                     role,[m
[32m+[m[32m                    is_active,[m
                     created_at[m
                 FROM users[m
[32m+[m[32m                ${whereClause}[m
                 ORDER BY created_at DESC[m
[31m-                `[m
[32m+[m[32m                `,[m
[32m+[m[32m                values[m
             );[m
 [m
             return res.status(200).json({[m
[31m-                users: result.rows[m
[32m+[m[32m                users: result.rows,[m
             });[m
[31m-[m
         } catch (error) {[m
             console.error("Get users error:", error);[m
 [m
             return res.status(500).json({[m
[31m-                message: "Failed to get users"[m
[32m+[m[32m                message: "Failed to get users",[m
             });[m
         }[m
     }[m
 );[m
 [m
[31m-module.exports = router;[m
\ No newline at end of file[m
[32m+[m[32m// Deactivate an account without deleting its historical records.[m
[32m+[m[32m// The controller enforces manager-account protection and self-deactivation protection.[m
[32m+[m[32mrouter.patch([m
[32m+[m[32m    "/:id/deactivate",[m
[32m+[m[32m    authMiddleware,[m
[32m+[m[32m    roleMiddleware("manager", "admin"),[m
[32m+[m[32m    deactivateUser[m
[32m+[m[32m);[m
[32m+[m
[32m+[m[32mmodule.exports = router;[m
