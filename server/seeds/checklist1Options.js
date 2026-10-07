const pool = require("../db/database");

const checklistTypeId =
    "90286988-53d6-4a65-bd87-f5771fc95960";

const options = [
    {
        fieldKey: "siteType",
        values: [
            "ایستگاه ثابت",
            "تکرار کننده",
        ],
    },

    {
        fieldKey: "wirelessAntennaConnectors",
        values: [
            "UG",
            "Heliax Male",
            "Heliax Female",
            "N-Type Male",
            "N-Type Female",
            "PL Male",
            "PL Female",
            "THER",
        ],
    },

    {
        fieldKey: "cableType",
        values: [
            "هلیاکس",
            "RG258",
            "RG58",
        ],
    },

    {
        fieldKey: "antennaType",
        values: [
            "4 دایپل 6 دیبی",
            "امنی",
            "یاگی",
            "ماکروویو 1",
            "ماکروویو 2",
            "ماکروویو 3",
            "ماکروویو 4",
        ],
    },

    {
        fieldKey: "towerType",
        values: [
            "مهاری 3 وجهی",
            "مهاری 4 وجهی",
            "خود ایستا",
        ],
    },

    {
        fieldKey: "baseType",
        values: [
            "G25",
            "G35",
            "G45",
        ],
    },

    {
        fieldKey: "towerInstallationLocation",
        values: [
            "روی زمین",
            "پشت بامی",
        ],
    },

    {
        fieldKey: "balancePlateStatus",
        values: [
            "سالم",
            "نیاز به تعویض یا آچارکشی",
        ],
    },

    {
        fieldKey: "guyWireStatus",
        values: [
            "سالم",
            "نیاز به تعویض یا رگلاژ",
        ],
    },

    {
        fieldKey: "rodStatus",
        values: [
            "سالم",
            "نیاز به تعویض یا آچارکشی",
        ],
    },

    {
        fieldKey: "towerBaseStatus",
        values: [
            "سالم",
            "نیاز رگلاژ یا تعویض یا آچارکشی",
        ],
    },

    {
        fieldKey: "earthingSystem",
        values: [
            "اکتیو",
            "میله ای",
        ],
    },

    {
        fieldKey: "earthResistance",
        values: [
            "آب ریز دارد",
            "آب ریز ندارد",
        ],
    },

    {
        fieldKey: "mastHeadLight",
        values: [
            "چراغ ندارد",
            "برق شهری",
            "خورشیدی",
            "سالم",
            "نیاز به تعویض",
        ],
    },
];

const seedChecklist1Options = async () => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (const group of options) {
            for (let i = 0; i < group.values.length; i++) {
                const value = group.values[i];

                await client.query(
                    `
                    INSERT INTO checklist_options
                    (
                        checklist_type_id,
                        field_key,
                        value,
                        sort_order
                    )
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (
                        checklist_type_id,
                        field_key,
                        value
                    )
                    DO NOTHING
                    `,
                    [
                        checklistTypeId,
                        group.fieldKey,
                        value,
                        i + 1,
                    ]
                );
            }
        }

        await client.query("COMMIT");

        console.log(
            "Checklist 1 options seeded successfully."
        );

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "Error seeding checklist 1 options:",
            error
        );
    } finally {
        client.release();
        await pool.end();
    }
};

seedChecklist1Options();