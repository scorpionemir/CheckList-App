const pool = require("../db/database");
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            birthDate,
            fatherName,
            nationalId,
            mobile,
            address
        } = req.body;

        if (
            !firstName ||
            !lastName ||
            !birthDate ||
            !fatherName ||
            !nationalId ||
            !mobile ||
            !address
        ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        const existingUser = await pool.query(
            `SELECT id
             FROM users
             WHERE national_id = $1 OR mobile = $2`,
            [nationalId, mobile]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "National ID or mobile number already exists"
            });
        }

        const passwordHash = await bcrypt.hash(mobile, 10);

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const userResult = await client.query(
                `INSERT INTO users
                (
                    username,
                    password_hash,
                    first_name,
                    last_name,
                    birth_date,
                    father_name,
                    national_id,
                    mobile
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, username, first_name, last_name, national_id, mobile, is_active`,
                [
                    nationalId,
                    passwordHash,
                    firstName,
                    lastName,
                    birthDate,
                    fatherName,
                    nationalId,
                    mobile
                ]
            );

            const user = userResult.rows[0];

            await client.query(
                `INSERT INTO user_addresses
                (
                    user_id,
                    province,
                    city,
                    district,
                    street,
                    alley,
                    plaque,
                    postal_code
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    user.id,
                    address.province,
                    address.city,
                    address.district,
                    address.street,
                    address.alley,
                    address.plaque,
                    address.postalCode
                ]
            );

            await client.query("COMMIT");

            res.status(201).json({
                message: "User created successfully",
                user
            });
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error creating user:", error);

        res.status(500).json({
            message: "Failed to create user"
        });
    }
};

module.exports = {
    createUser
};